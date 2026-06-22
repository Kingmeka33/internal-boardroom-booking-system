import { Injectable } from "@nestjs/common";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { Amenity } from "../../modules/amenities/amenity.entity";
import { AmenityResponseDto } from "../../modules/amenities/dto/amenity-response.dto";
import { Boardroom } from "../../modules/boardrooms/boardroom.entity";
import { BoardroomResponseDto } from "../../modules/boardrooms/dto/boardroom-response.dto";
import { BoardroomBlock } from "../../modules/boardroom-blocks/boardroom-block.entity";
import { BoardroomBlockResponseDto } from "../../modules/boardroom-blocks/dto/boardroom-block-response.dto";
import { Booking } from "../../modules/bookings/booking.entity";
import { BookingResponseDto } from "../../modules/bookings/dto/booking-response.dto";
import { User } from "../../modules/users/user.entity";
import { UserResponseDto } from "../../modules/users/dto/user-response.dto";

type AvailableBoardroom = Boardroom & {
  isAvailable?: boolean;
  unavailableReason?: string | null;
};

@Injectable()
export class AppMapperService {
  constructor(@InjectMapper() private readonly mapper: Mapper) {}

  // Converts one amenity entity into the API response shape.
  toAmenityResponse(amenity: Amenity): AmenityResponseDto {
    return this.mapper.map(amenity, Amenity, AmenityResponseDto);
  }

  // Converts many amenity entities into API response shapes.
  toAmenityResponses(amenities: Amenity[]): AmenityResponseDto[] {
    return this.mapper.mapArray(amenities, Amenity, AmenityResponseDto);
  }

  // Converts one user entity into the API response shape.
  toUserResponse(user: User): UserResponseDto {
    return this.mapper.map(user, User, UserResponseDto);
  }

  // Converts many user entities into API response shapes.
  toUserResponses(users: User[]): UserResponseDto[] {
    return this.mapper.mapArray(users, User, UserResponseDto);
  }

  // Converts one boardroom entity into the API response shape.
  toBoardroomResponse(room: AvailableBoardroom): BoardroomResponseDto {
    return this.mapper.map(room, Boardroom, BoardroomResponseDto);
  }

  // Converts many boardroom entities into API response shapes.
  toBoardroomResponses(rooms: AvailableBoardroom[]): BoardroomResponseDto[] {
    return this.mapper.mapArray(rooms, Boardroom, BoardroomResponseDto);
  }

  // Converts one room block entity into the API response shape.
  toBoardroomBlockResponse(block: BoardroomBlock): BoardroomBlockResponseDto {
    return this.mapper.map(block, BoardroomBlock, BoardroomBlockResponseDto);
  }

  // Converts many room block entities into API response shapes.
  toBoardroomBlockResponses(blocks: BoardroomBlock[]): BoardroomBlockResponseDto[] {
    return this.mapper.mapArray(blocks, BoardroomBlock, BoardroomBlockResponseDto);
  }

  // Converts one booking entity into the API response shape.
  toBookingResponse(booking: Booking): BookingResponseDto {
    return this.mapper.map(booking, Booking, BookingResponseDto);
  }

  // Converts many booking entities into API response shapes.
  toBookingResponses(bookings: Booking[]): BookingResponseDto[] {
    return this.mapper.mapArray(bookings, Booking, BookingResponseDto);
  }
}
