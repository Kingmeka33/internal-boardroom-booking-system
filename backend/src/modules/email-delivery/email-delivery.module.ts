import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "../audit-logs/audit-log.entity";
import { Notification } from "../notifications/notification.entity";
import { User } from "../users/user.entity";
import { EmailDeliveryController } from "./email-delivery.controller";
import { EmailDeliveryLog } from "./email-delivery-log.entity";
import { EmailDeliveryService } from "./email-delivery.service";

@Module({
  imports: [TypeOrmModule.forFeature([EmailDeliveryLog, AuditLog, Notification, User])],
  controllers: [EmailDeliveryController],
  providers: [EmailDeliveryService],
  exports: [EmailDeliveryService],
})
export class EmailDeliveryModule {}
