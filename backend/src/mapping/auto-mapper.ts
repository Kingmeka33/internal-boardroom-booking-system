import { Amenity } from "../../modules/amenities/amenity.entity";
import { BoardroomBlock } from "../../modules/boardroom-blocks/boardroom-block.entity";
import { Boardroom } from "../../modules/boardrooms/boardroom.entity";
import { Booking } from "../../modules/bookings/booking.entity";
import { User } from "../../modules/users/user.entity";

type AvailableBoardroom = Boardroom & {
  isAvailable?: boolean;
  unavailableReason?: string | null;
};

export class AutoMapper {
  static toAmenityEntity(payload: Partial<Amenity>): Partial<Amenity> {
    return {
      name: payload.name,
      description: payload.description,
      icon: payload.icon,
      isActive: payload.isActive,
    };
  }

  static toAmenityResponse(amenity: Amenity) {
    return {
      id: amenity.id,
      name: amenity.name,
      description: amenity.description,
      icon: amenity.icon,
      isActive: amenity.isActive,
      createdAt: amenity.createdAt,
      updatedAt: amenity.updatedAt,
    };
  }

  static toUserEntity(payload: Partial<User>): Partial<User> {
    return {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      department: payload.department,
      jobTitle: payload.jobTitle,
      isActive: payload.isActive,
    };
  }

  static toUserResponse(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      department: user.department,
      jobTitle: user.jobTitle,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toBoardroomEntity(payload: Partial<Boardroom>): Partial<Boardroom> {
    return {
      name: payload.name,
      code: payload.code,
      description: payload.description,
      location: payload.location,
      floor: payload.floor,
      building: payload.building,
      capacity: payload.capacity,
      imageUrl: payload.imageUrl,
      isActive: payload.isActive,
      isBookable: payload.isBookable,
      requiresApproval: payload.requiresApproval,
      openingTime: payload.openingTime,
      closingTime: payload.closingTime,
      minimumBookingMinutes: payload.minimumBookingMinutes,
      maximumBookingMinutes: payload.maximumBookingMinutes,
      bufferTimeBeforeMinutes: payload.bufferTimeBeforeMinutes,
      bufferTimeAfterMinutes: payload.bufferTimeAfterMinutes,
    };
  }

  static toBoardroomResponse(room: AvailableBoardroom) {
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
      amenities: (room.amenities || []).map((amenity) => AutoMapper.toAmenityResponse(amenity)),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  }

  static toBoardroomBlockResponse(block: BoardroomBlock) {
    return {
      id: block.id,
      boardroom: block.boardroom
        ? {
            id: block.boardroom.id,
            name: block.boardroom.name,
            location: block.boardroom.location,
          }
        : null,
      reason: block.reason,
      startDateTime: block.startDateTime,
      endDateTime: block.endDateTime,
      isActive: block.isActive,
      createdByUser: block.createdByUser
        ? {
            id: block.createdByUser.id,
            firstName: block.createdByUser.firstName,
            lastName: block.createdByUser.lastName,
            email: block.createdByUser.email,
          }
        : null,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    };
  }

  static toBookingResponse(booking: Booking) {
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
      bookedByUser: AutoMapper.toBookingUserResponse(booking.bookedByUser),
      approvedByUser: booking.approvedByUser
        ? AutoMapper.toBookingUserResponse(booking.approvedByUser)
        : undefined,
      rejectedByUser: booking.rejectedByUser
        ? AutoMapper.toBookingUserResponse(booking.rejectedByUser)
        : undefined,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  private static toBookingUserResponse(user: User) {
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
