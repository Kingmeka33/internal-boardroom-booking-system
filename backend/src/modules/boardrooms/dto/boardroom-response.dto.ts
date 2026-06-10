import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AmenityResponseDto } from "../../amenities/dto/amenity-response.dto";
import { Boardroom } from "../boardroom.entity";

export class AvailabilityBookingResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() start: Date;
  @ApiProperty() end: Date;
  @ApiProperty() status: string;
}

export class AvailabilityBlockResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() reason: string;
  @ApiProperty() start: Date;
  @ApiProperty() end: Date;
}

export class BoardroomAvailabilityResponseDto {
  @ApiProperty() boardroomId: string;
  @ApiProperty() boardroomName: string;
  @ApiProperty() date: string;
  @ApiProperty() openingTime: string;
  @ApiProperty() closingTime: string;
  @ApiProperty({ type: [AvailabilityBookingResponseDto] })
  bookings: AvailabilityBookingResponseDto[];
  @ApiProperty({ type: [AvailabilityBlockResponseDto] })
  blocks: AvailabilityBlockResponseDto[];
}

export class BoardroomResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() location: string;
  @ApiPropertyOptional() floor?: string;
  @ApiPropertyOptional() building?: string;
  @ApiProperty() capacity: number;
  @ApiPropertyOptional() imageUrl?: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isBookable: boolean;
  @ApiProperty() requiresApproval: boolean;
  @ApiProperty() openingTime: string;
  @ApiProperty() closingTime: string;
  @ApiProperty() minimumBookingMinutes: number;
  @ApiProperty() maximumBookingMinutes: number;
  @ApiProperty() bufferTimeBeforeMinutes: number;
  @ApiProperty() bufferTimeAfterMinutes: number;
  @ApiPropertyOptional() isAvailable?: boolean;
  @ApiPropertyOptional() unavailableReason?: string | null;
  @ApiProperty({ type: [AmenityResponseDto] })
  amenities: AmenityResponseDto[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(room: Boardroom & { isAvailable?: boolean; unavailableReason?: string | null }): BoardroomResponseDto {
    return {
      id: room.id,
      name: room.name,
      code: room.code,
      description: room.description,
      location: room.location,
      floor: room.floor,
      building: room.building,
      capacity: room.capacity,
      imageUrl: room.imageUrl,
      isActive: room.isActive,
      isBookable: room.isBookable,
      requiresApproval: room.requiresApproval,
      openingTime: room.openingTime,
      closingTime: room.closingTime,
      minimumBookingMinutes: room.minimumBookingMinutes,
      maximumBookingMinutes: room.maximumBookingMinutes,
      bufferTimeBeforeMinutes: room.bufferTimeBeforeMinutes,
      bufferTimeAfterMinutes: room.bufferTimeAfterMinutes,
      isAvailable: room.isAvailable,
      unavailableReason: room.unavailableReason,
      amenities: AmenityResponseDto.collection(room.amenities || []),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  static collection(rooms: (Boardroom & { isAvailable?: boolean; unavailableReason?: string | null })[]): BoardroomResponseDto[] {
    return rooms.map((room) => BoardroomResponseDto.fromEntity(room));
  }
}
