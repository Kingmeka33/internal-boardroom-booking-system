import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../bookings/booking.entity";
import { EmailDeliveryModule } from "../email-delivery/email-delivery.module";
import { SystemSetting } from "../system-settings/system-setting.entity";
import { BackgroundJobsService } from "./background-jobs.service";
import { EmailQueueModule } from "./email-queue.module";
import { EmailReminderJobConsumerService } from "./email-reminder-job-consumer.service";

@Module({
  imports: [
    EmailQueueModule,
    EmailDeliveryModule,
    TypeOrmModule.forFeature([Booking, SystemSetting]),
  ],
  providers: [BackgroundJobsService, EmailReminderJobConsumerService],
  exports: [BackgroundJobsService],
})
export class BackgroundJobsModule {}
