import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { EmailReminderJobResponseDto } from "./dto/email-reminder-job-response.dto";
import { EmailJobName, EmailQueueName } from "./email-job.constants";

@Injectable()
export class BackgroundJobsService {
  private readonly logger = new Logger(BackgroundJobsService.name);

  constructor(
    @InjectQueue(EmailQueueName.Email)
    private readonly emailQueue: Queue,
  ) {}

  // Places the full reminder cycle on the BullMQ queue.
  async processEmailReminderJob(): Promise<EmailReminderJobResponseDto> {
    try {
      return this.enqueueEmailJob(EmailJobName.RunReminderCycle, "full reminder cycle");
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `processEmailReminderJob failed: ${error.message}`
          : "processEmailReminderJob failed",
      );
      throw error;
    }
  }

  // Places only due booking reminders on the BullMQ queue.
  async sendDueBookingReminders(): Promise<EmailReminderJobResponseDto> {
    try {
      return this.enqueueEmailJob(
        EmailJobName.SendDueBookingReminders,
        "due booking reminders",
      );
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `sendDueBookingReminders failed: ${error.message}`
          : "sendDueBookingReminders failed",
      );
      throw error;
    }
  }

  // Places queued email delivery processing on the BullMQ queue.
  async processQueuedEmails(): Promise<EmailReminderJobResponseDto> {
    try {
      return this.enqueueEmailJob(EmailJobName.ProcessQueuedEmails, "queued emails");
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `processQueuedEmails failed: ${error.message}`
          : "processQueuedEmails failed",
      );
      throw error;
    }
  }

  // Places failed email retry processing on the BullMQ queue.
  async retryDueFailures(): Promise<EmailReminderJobResponseDto> {
    try {
      return this.enqueueEmailJob(EmailJobName.RetryDueFailures, "email retries");
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `retryDueFailures failed: ${error.message}`
          : "retryDueFailures failed",
      );
      throw error;
    }
  }

  // Adds a named email job and returns quickly so API requests are not blocked.
  private async enqueueEmailJob(
    jobName: EmailJobName,
    description: string,
  ): Promise<EmailReminderJobResponseDto> {
    try {
      await this.emailQueue.add(
        jobName,
        { description },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 10000 },
          removeOnComplete: 50,
          removeOnFail: 100,
        },
      );

      this.logger.log(`Queued email background job: ${description}`);
      return {
        windowMinutes: 0,
        sent: 0,
        queued: 1,
        failed: 0,
        skipped: 0,
        retries: 0,
      };
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? `enqueueEmailJob failed: ${error.message}`
          : "enqueueEmailJob failed",
      );
      throw error;
    }
  }
}
