import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../bookings/booking.entity";
import { Boardroom } from "../boardrooms/boardroom.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
@Module({
  imports: [TypeOrmModule.forFeature([Booking, Boardroom])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
