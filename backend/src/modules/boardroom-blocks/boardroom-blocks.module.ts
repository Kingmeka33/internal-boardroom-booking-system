import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "../audit-logs/audit-log.entity";
import { Boardroom } from "../boardrooms/boardroom.entity";
import { Notification } from "../notifications/notification.entity";
import { User } from "../users/user.entity";
import { BoardroomBlock } from "./boardroom-block.entity";
import { BoardroomBlocksController } from "./boardroom-blocks.controller";
import { BoardroomBlocksService } from "./boardroom-blocks.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardroomBlock,
      Boardroom,
      Notification,
      AuditLog,
      User,
    ]),
  ],
  controllers: [BoardroomBlocksController],
  providers: [BoardroomBlocksService],
})
export class BoardroomBlocksModule {}
