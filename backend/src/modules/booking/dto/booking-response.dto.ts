import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BookingStatus } from "../../../shared/enums/booking-status.enum";
import { Booking } from "../booking.entity";

export class BookingBoardroomResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() location: string;
  @ApiPropertyOptional() building?: string;
  @ApiPropertyOptional() floor?: string;
  @ApiProperty() capacity: number;
  @ApiPropertyOptional() imageUrl?: string;
}

export class BookingUserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiPropertyOptional() department?: string;
  @ApiPropertyOptional() jobTitle?: string;
  @ApiPropertyOptional() role?: string;
}

export class CalendarEventResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() start: Date;
  @ApiProperty() end: Date;
  @ApiProperty() status: string;
  @ApiPropertyOptional() boardroomId?: string;
  @ApiPropertyOptional() boardroom?: string;
  @ApiProperty() owner: string;
}

export class BookingResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() startDateTime: Date;
  @ApiProperty() endDateTime: Date;
  @ApiProperty({ enum: BookingStatus }) status: BookingStatus;
  @ApiPropertyOptional() meetingType?: string;
  @ApiProperty() attendeeCount: number;
  @ApiProperty() requiresCatering: boolean;
  @ApiPropertyOptional() cateringNotes?: string;
  @ApiProperty() requiresSetup: boolean;
  @ApiPropertyOptional() setupNotes?: string;
  @ApiPropertyOptional() cancellationReason?: string;
  @ApiPropertyOptional() rejectionReason?: string;
  @ApiPropertyOptional() approvedAt?: Date;
  @ApiPropertyOptional() rejectedAt?: Date;
  @ApiProperty({ type: BookingBoardroomResponseDto })
  boardroom: BookingBoardroomResponseDto;
  @ApiProperty({ type: BookingUserResponseDto })
  bookedByUser: BookingUserResponseDto;
  @ApiPropertyOptional({ type: BookingUserResponseDto })
  approvedByUser?: BookingUserResponseDto;
  @ApiPropertyOptional({ type: BookingUserResponseDto })
  rejectedByUser?: BookingUserResponseDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      title: booking.title,
      description: booking.description,
      startDateTime: booking.startDateTime,
      endDateTime: booking.endDateTime,
      status: booking.status,
      meetingType: booking.meetingType,
      attendeeCount: booking.attendeeCount,
      requiresCatering: booking.requiresCatering,
      cateringNotes: booking.cateringNotes,
      requiresSetup: booking.requiresSetup,
      setupNotes: booking.setupNotes,
      cancellationReason: booking.cancellationReason,
      rejectionReason: booking.rejectionReason,
      approvedAt: booking.approvedAt,
      rejectedAt: booking.rejectedAt,
      boardroom: booking.boardroom
        ? {
            id: booking.boardroom.id,
            name: booking.boardroom.name,
            location: booking.boardroom.location,
            building: booking.boardroom.building,
            floor: booking.boardroom.floor,
            capacity: booking.boardroom.capacity,
            imageUrl: booking.boardroom.imageUrl,
          }
        : null,
      bookedByUser: BookingResponseDto.userSummary(booking.bookedByUser),
      approvedByUser: booking.approvedByUser ? BookingResponseDto.userSummary(booking.approvedByUser) : undefined,
      rejectedByUser: booking.rejectedByUser ? BookingResponseDto.userSummary(booking.rejectedByUser) : undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  static collection(bookings: Booking[]): BookingResponseDto[] {
    return bookings.map((booking) => BookingResponseDto.fromEntity(booking));
  }

  private static userSummary(user: Booking["bookedByUser"]): BookingUserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      jobTitle: user.jobTitle,
      role: user.role?.name,
    };
  }
}
