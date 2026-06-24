import { Injectable, Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Job } from "bullmq";
import { Repository } from "typeorm";
import { BookingStatus } from "../../shared/enums/booking-status.enum";
import { Booking } from "../bookings/booking.entity";
import { EmailDeliveryService } from "../email-delivery/email-delivery.service";
import { SystemSetting } from "../system-settings/system-setting.entity";
import { EmailReminderJobResponseDto } from "./dto/email-reminder-job-response.dto";
import { EmailJobName, EmailQueueName } from "./email-job.constants";

enum EmailReminderSettingKey {
  EmailRemindersEnabled = "EMAIL_REMINDERS_ENABLED",
  BookingReminderMinutesBefore = "BOOKING_REMINDER_MINUTES_BEFORE",
}

enum EmailReminderJobType {
  BookingReminderEmail = "BOOKING_REMINDER_EMAIL",
}

@Injectable()
@Processor(EmailQueueName.Email)
export class EmailReminderJobConsumerService extends WorkerHost {
  private readonly logger = new Logger(EmailReminderJobConsumerService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    @InjectRepository(SystemSetting)
    private readonly settings: Repository<SystemSetting>,
    private readonly emailDelivery: EmailDeliveryService,
  ) {
    super();
  }

  // Receives BullMQ jobs and sends them to the correct email worker method.
  async process(job: Job): Promise<unknown> {
    try {
      this.logger.log(`Processing email job ${job.name}`);

      switch (job.name as EmailJobName) {
        case EmailJobName.RunReminderCycle:
          return this.processEmailReminderJob();
        case EmailJobName.SendDueBookingReminders:
          return this.sendDueBookingReminders();
        case EmailJobName.ProcessQueuedEmails:
          return this.emailDelivery.processQueuedEmails();
        case EmailJobName.RetryDueFailures:
          return this.emailDelivery.retryDueFailures();
        default:
          this.logger.warn(`Unknown email job ignored: ${job.name}`);
          return null;
      }
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `process failed: ${error.message}`
          : "process failed",
      );
      throw error;
    }
  }

  // Runs the full reminder job inside the BullMQ worker.
  async processEmailReminderJob(): Promise<EmailReminderJobResponseDto> {
    try {
      const reminderResult = await this.sendDueBookingReminders();
      const queuedResult = await this.emailDelivery.processQueuedEmails();
      const retryResult = await this.emailDelivery.retryDueFailures();
      const processedResults = [...queuedResult, ...retryResult];
      const result = {
        ...reminderResult,
        sent: processedResults.filter((email) =>
          ["SENT", "RECORDED_ONLY"].includes(email.status),
        ).length,
        failed: processedResults.filter((email) => email.status === "FAILED")
          .length,
        retries: retryResult.length,
      };

      if (result.queued || result.sent || result.failed || result.retries) {
        this.logger.log(
          `Email background job finished queued=${result.queued}, sent=${result.sent}, failed=${result.failed}, skipped=${result.skipped}, retries=${result.retries}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : "Email reminder consumer failed",
      );
      throw error;
    }
  }

  // Finds approved bookings that need reminder emails.
  async sendDueBookingReminders(): Promise<EmailReminderJobResponseDto> {
    try {
      const remindersEnabled = await this.getBooleanSetting(
        EmailReminderSettingKey.EmailRemindersEnabled,
        true,
      );
      const windowMinutes = await this.getNumberSetting(
        EmailReminderSettingKey.BookingReminderMinutesBefore,
        15,
      );

      if (!remindersEnabled) {
        return {
          windowMinutes,
          sent: 0,
          queued: 0,
          failed: 0,
          skipped: 0,
          retries: 0,
        };
      }

      const now = new Date();
      const reminderWindowEnd = new Date(now.getTime() + windowMinutes * 60000);
      const dueBookings = await this.bookings
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.boardroom", "boardroom")
        .leftJoinAndSelect("booking.bookedByUser", "bookedByUser")
        .where("booking.status = :status", { status: BookingStatus.APPROVED })
        .andWhere("booking.startDateTime >= :now", { now })
        .andWhere("booking.startDateTime <= :reminderWindowEnd", {
          reminderWindowEnd,
        })
        .orderBy("booking.startDateTime", "ASC")
        .getMany();

      return this.sendReminderEmails(dueBookings, windowMinutes);
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : "Sending due booking reminders failed",
      );
      throw error;
    }
  }

  // Sends reminder emails for the bookings found by the job.
  private async sendReminderEmails(
    bookings: Booking[],
    windowMinutes: number,
  ): Promise<EmailReminderJobResponseDto> {
    try {
      let sent = 0;
      let failed = 0;
      let skipped = 0;
      let queued = 0;

      for (const booking of bookings) {
        const alreadyQueued =
          await this.emailDelivery.hasAnyDeliveryForMetadata(
            EmailReminderJobType.BookingReminderEmail,
            "bookingId",
            booking.id,
          );
        if (alreadyQueued) {
          skipped += 1;
          continue;
        }

        const result = await this.emailDelivery.sendBookingEmail({
          recipient: booking.bookedByUser?.email,
          recipientName:
            `${booking.bookedByUser?.firstName || ""} ${booking.bookedByUser?.lastName || ""}`.trim(),
          subject: `Booking reminder: ${booking.title}`,
          body: this.bookingEmailBody(
            booking,
            `Reminder: your booking starts in ${windowMinutes} minute(s) or less.`,
          ),
          type: EmailReminderJobType.BookingReminderEmail,
          metadata: {
            bookingId: booking.id,
            boardroomId: booking.boardroom?.id,
            reminderMinutesBefore: windowMinutes,
          },
        });

        if (!result) skipped += 1;
        else if (result.status === "FAILED") failed += 1;
        else if (result.status === "QUEUED") queued += 1;
        else sent += 1;
      }

      return { windowMinutes, sent, queued, failed, skipped, retries: 0 };
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : "Sending reminder emails failed",
      );
      throw error;
    }
  }

  // Reads a yes/no system setting and treats only "yes" as true.
  private async getBooleanSetting(
    key: EmailReminderSettingKey,
    fallback: boolean,
  ): Promise<boolean> {
    try {
      const setting = await this.settings.findOne({ where: { key } });
      if (!setting) return fallback;
      return setting.value.toLowerCase() === "yes";
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : `Failed to read ${key}`,
      );
      return fallback;
    }
  }

  // Reads a numeric system setting and falls back if it is missing or invalid.
  private async getNumberSetting(
    key: EmailReminderSettingKey,
    fallback: number,
  ): Promise<number> {
    try {
      const setting = await this.settings.findOne({ where: { key } });
      if (!setting) return fallback;
      const value = Number(setting.value);
      return Number.isFinite(value) ? value : fallback;
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : `Failed to read ${key}`,
      );
      return fallback;
    }
  }

  // Builds the plain-text email body sent to the employee.
  private bookingEmailBody(booking: Booking, intro: string): string {
    try {
      return [
        intro,
        "",
        `Meeting: ${booking.title}`,
        `Room: ${booking.boardroom?.name || "Boardroom"}`,
        `Start: ${booking.startDateTime}`,
        `End: ${booking.endDateTime}`,
        `Status: ${booking.status}`,
        "",
        "Internal Boardroom Booking System",
      ].join("\n");
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : "Failed to build email body",
      );
      return "Internal Boardroom Booking System reminder";
    }
  }
}
