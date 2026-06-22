import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BackgroundJobsService } from "../background-jobs/background-jobs.service";

enum SchedulerEnvKey {
  BookingReminderWorkerEnabled = "BOOKING_REMINDER_WORKER_ENABLED",
}

const STARTUP_DELAY_MS = 5000;

@Injectable()
export class EmailReminderSchedulerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(EmailReminderSchedulerService.name);
  private running = false;
  private startupTimeout?: ReturnType<typeof setTimeout>;

  constructor(private readonly backgroundJobs: BackgroundJobsService) {}

  // Runs once shortly after startup so queued emails do not wait for the first cron tick.
  onApplicationBootstrap(): void {
    try {
      if (!this.schedulerEnabled()) {
        this.logger.log("Email reminder scheduler is disabled");
        return;
      }

      this.startupTimeout = setTimeout(() => {
        void this.runEmailBackgroundJob("startup");
      }, STARTUP_DELAY_MS);
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : "Failed to start email reminder scheduler",
      );
    }
  }

  // Clears the startup timer if the application shuts down before it runs.
  onApplicationShutdown(): void {
    try {
      if (this.startupTimeout) clearTimeout(this.startupTimeout);
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : "Failed to stop email reminder scheduler",
      );
    }
  }

  // Cron wakes the background worker once per minute.
  @Cron(CronExpression.EVERY_MINUTE)
  async runEmailReminderCron(): Promise<void> {
    try {
      if (!this.schedulerEnabled()) return;
      await this.runEmailBackgroundJob("cron");
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : "Email reminder cron execution failed",
      );
    }
  }

  // Runs the email background job while preventing overlapping executions.
  private async runEmailBackgroundJob(source: "startup" | "cron"): Promise<void> {
    try {
      if (this.running) {
        this.logger.warn(
          `Email background job skipped during ${source} because a previous run is still active`,
        );
        return;
      }

      this.running = true;
      const result = await this.backgroundJobs.processEmailReminderJob();
      if (result.queued || result.sent || result.failed || result.retries) {
        this.logger.log(
          `Email background job ${source} run completed queued=${result.queued}, sent=${result.sent}, failed=${result.failed}, retries=${result.retries}`,
        );
      }
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : "Email background job failed",
      );
    } finally {
      this.running = false;
    }
  }

  // Reads a yes/no .env switch and treats only "yes" as enabled.
  private schedulerEnabled(): boolean {
    try {
      return this.booleanEnv(SchedulerEnvKey.BookingReminderWorkerEnabled, true);
    } catch (error) {
      this.logger.error(
        error instanceof Error
          ? error.message
          : "Failed to read scheduler enabled setting",
      );
      return true;
    }
  }

  // Parses a boolean environment value using yes-only semantics.
  private booleanEnv(key: SchedulerEnvKey, fallback: boolean): boolean {
    try {
      const value = process.env[key];
      if (value === undefined || value === null || value === "") return fallback;
      return value.toLowerCase() === "yes";
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : `Failed to read ${key}`,
      );
      return fallback;
    }
  }
}
