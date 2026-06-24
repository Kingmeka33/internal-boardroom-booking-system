import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "../background-jobs/background-jobs.module";
import { EmailReminderSchedulerService } from "./email-reminder-scheduler.service";

@Module({
  imports: [BackgroundJobsModule],
  providers: [EmailReminderSchedulerService],
})
export class SchedulerModule {}
