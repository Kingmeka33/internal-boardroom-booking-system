import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Amenity } from "../amenities/amenity.entity";
import { Booking } from "../bookings/booking.entity";
import { BoardroomBlock } from "../boardroom-blocks/boardroom-block.entity";
import { Boardroom } from "./boardroom.entity";
import { BoardroomsController } from "./boardrooms.controller";
import { BoardroomsService } from "./boardrooms.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Boardroom, Amenity, Booking, BoardroomBlock]),
  ],
  controllers: [BoardroomsController],
  providers: [BoardroomsService],
  exports: [BoardroomsService],
})
export class BoardroomsModule {}
