import { Injectable } from "@nestjs/common";
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Amenity } from "../../modules/amenities/amenity.entity";
import { AmenityResponseDto } from "../../modules/amenities/dto/amenity-response.dto";
import {
  BoardroomAvailabilityResponseDto,
  BoardroomResponseDto,
} from "../../modules/boardrooms/dto/boardroom-response.dto";
import { Boardroom } from "../../modules/boardrooms/boardroom.entity";
import { BoardroomBlock } from "../../modules/boardroom-blocks/boardroom-block.entity";
import {
  BoardroomBlockResponseDto,
  BoardroomBlockRoomResponseDto,
  BoardroomBlockUserResponseDto,
} from "../../modules/boardroom-blocks/dto/boardroom-block-response.dto";
import { Booking } from "../../modules/bookings/booking.entity";
import {
  BookingBoardroomResponseDto,
  BookingResponseDto,
  BookingUserResponseDto,
} from "../../modules/bookings/dto/booking-response.dto";
import { Role } from "../../modules/roles/role.entity";
import { User } from "../../modules/users/user.entity";
import {
  UserResponseDto,
  UserRoleResponseDto,
} from "../../modules/users/dto/user-response.dto";

@Injectable()
export class AppMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile(): MappingProfile {
    return (mapper) => {
      createMap(
        mapper,
        Amenity,
        AmenityResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.name, mapFrom((entity) => entity.name)),
        forMember((dto) => dto.description, mapFrom((entity) => entity.description)),
        forMember((dto) => dto.icon, mapFrom((entity) => entity.icon)),
        forMember((dto) => dto.isActive, mapFrom((entity) => entity.isActive)),
        forMember((dto) => dto.createdAt, mapFrom((entity) => entity.createdAt)),
        forMember((dto) => dto.updatedAt, mapFrom((entity) => entity.updatedAt)),
      );

      createMap(
        mapper,
        Role,
        UserRoleResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.name, mapFrom((entity) => entity.name)),
      );

      createMap(
        mapper,
        User,
        UserResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.firstName, mapFrom((entity) => entity.firstName)),
        forMember((dto) => dto.lastName, mapFrom((entity) => entity.lastName)),
        forMember((dto) => dto.email, mapFrom((entity) => entity.email)),
        forMember((dto) => dto.phoneNumber, mapFrom((entity) => entity.phoneNumber)),
        forMember((dto) => dto.department, mapFrom((entity) => entity.department)),
        forMember((dto) => dto.jobTitle, mapFrom((entity) => entity.jobTitle)),
        forMember(
          (dto) => dto.role,
          mapFrom((entity) =>
            entity.role ? mapper.map(entity.role, Role, UserRoleResponseDto) : null,
          ),
        ),
        forMember((dto) => dto.isActive, mapFrom((entity) => entity.isActive)),
        forMember((dto) => dto.createdAt, mapFrom((entity) => entity.createdAt)),
        forMember((dto) => dto.updatedAt, mapFrom((entity) => entity.updatedAt)),
      );

      createMap(
        mapper,
        Boardroom,
        BoardroomResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.name, mapFrom((entity) => entity.name)),
        forMember((dto) => dto.code, mapFrom((entity) => entity.code)),
        forMember((dto) => dto.description, mapFrom((entity) => entity.description)),
        forMember((dto) => dto.location, mapFrom((entity) => entity.location)),
        forMember((dto) => dto.floor, mapFrom((entity) => entity.floor)),
        forMember((dto) => dto.building, mapFrom((entity) => entity.building)),
        forMember((dto) => dto.capacity, mapFrom((entity) => entity.capacity)),
        forMember((dto) => dto.imageUrl, mapFrom((entity) => entity.imageUrl)),
        forMember((dto) => dto.isActive, mapFrom((entity) => entity.isActive)),
        forMember((dto) => dto.isBookable, mapFrom((entity) => entity.isBookable)),
        forMember(
          (dto) => dto.requiresApproval,
          mapFrom((entity) => entity.requiresApproval),
        ),
        forMember((dto) => dto.openingTime, mapFrom((entity) => entity.openingTime)),
        forMember((dto) => dto.closingTime, mapFrom((entity) => entity.closingTime)),
        forMember(
          (dto) => dto.minimumBookingMinutes,
          mapFrom((entity) => entity.minimumBookingMinutes),
        ),
        forMember(
          (dto) => dto.maximumBookingMinutes,
          mapFrom((entity) => entity.maximumBookingMinutes),
        ),
        forMember(
          (dto) => dto.bufferTimeBeforeMinutes,
          mapFrom((entity) => entity.bufferTimeBeforeMinutes),
        ),
        forMember(
          (dto) => dto.bufferTimeAfterMinutes,
          mapFrom((entity) => entity.bufferTimeAfterMinutes),
        ),
        forMember(
          (dto) => dto.isAvailable,
          mapFrom((entity: Boardroom & { isAvailable?: boolean }) => entity.isAvailable),
        ),
        forMember(
          (dto) => dto.unavailableReason,
          mapFrom(
            (entity: Boardroom & { unavailableReason?: string | null }) =>
              entity.unavailableReason,
          ),
        ),
        forMember(
          (dto) => dto.amenities,
          mapFrom((entity) =>
            mapper.mapArray(entity.amenities || [], Amenity, AmenityResponseDto),
          ),
        ),
        forMember((dto) => dto.createdAt, mapFrom((entity) => entity.createdAt)),
        forMember((dto) => dto.updatedAt, mapFrom((entity) => entity.updatedAt)),
      );

      createMap(
        mapper,
        Boardroom,
        BoardroomBlockRoomResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.name, mapFrom((entity) => entity.name)),
        forMember((dto) => dto.location, mapFrom((entity) => entity.location)),
      );

      createMap(
        mapper,
        User,
        BoardroomBlockUserResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.firstName, mapFrom((entity) => entity.firstName)),
        forMember((dto) => dto.lastName, mapFrom((entity) => entity.lastName)),
        forMember((dto) => dto.email, mapFrom((entity) => entity.email)),
      );

      createMap(
        mapper,
        BoardroomBlock,
        BoardroomBlockResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember(
          (dto) => dto.boardroom,
          mapFrom((entity) =>
            entity.boardroom
              ? mapper.map(entity.boardroom, Boardroom, BoardroomBlockRoomResponseDto)
              : null,
          ),
        ),
        forMember((dto) => dto.reason, mapFrom((entity) => entity.reason)),
        forMember(
          (dto) => dto.startDateTime,
          mapFrom((entity) => entity.startDateTime),
        ),
        forMember((dto) => dto.endDateTime, mapFrom((entity) => entity.endDateTime)),
        forMember((dto) => dto.isActive, mapFrom((entity) => entity.isActive)),
        forMember(
          (dto) => dto.createdByUser,
          mapFrom((entity) =>
            entity.createdByUser
              ? mapper.map(entity.createdByUser, User, BoardroomBlockUserResponseDto)
              : null,
          ),
        ),
        forMember((dto) => dto.createdAt, mapFrom((entity) => entity.createdAt)),
        forMember((dto) => dto.updatedAt, mapFrom((entity) => entity.updatedAt)),
      );

      createMap(
        mapper,
        Boardroom,
        BookingBoardroomResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.name, mapFrom((entity) => entity.name)),
        forMember((dto) => dto.location, mapFrom((entity) => entity.location)),
        forMember((dto) => dto.building, mapFrom((entity) => entity.building)),
        forMember((dto) => dto.floor, mapFrom((entity) => entity.floor)),
        forMember((dto) => dto.capacity, mapFrom((entity) => entity.capacity)),
        forMember((dto) => dto.imageUrl, mapFrom((entity) => entity.imageUrl)),
      );

      createMap(
        mapper,
        User,
        BookingUserResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.firstName, mapFrom((entity) => entity.firstName)),
        forMember((dto) => dto.lastName, mapFrom((entity) => entity.lastName)),
        forMember((dto) => dto.email, mapFrom((entity) => entity.email)),
        forMember((dto) => dto.department, mapFrom((entity) => entity.department)),
        forMember((dto) => dto.jobTitle, mapFrom((entity) => entity.jobTitle)),
        forMember((dto) => dto.role, mapFrom((entity) => entity.role?.name)),
      );

      createMap(
        mapper,
        Booking,
        BookingResponseDto,
        forMember((dto) => dto.id, mapFrom((entity) => entity.id)),
        forMember((dto) => dto.title, mapFrom((entity) => entity.title)),
        forMember((dto) => dto.description, mapFrom((entity) => entity.description)),
        forMember(
          (dto) => dto.startDateTime,
          mapFrom((entity) => entity.startDateTime),
        ),
        forMember((dto) => dto.endDateTime, mapFrom((entity) => entity.endDateTime)),
        forMember((dto) => dto.status, mapFrom((entity) => entity.status)),
        forMember((dto) => dto.meetingType, mapFrom((entity) => entity.meetingType)),
        forMember((dto) => dto.attendeeCount, mapFrom((entity) => entity.attendeeCount)),
        forMember(
          (dto) => dto.requiresCatering,
          mapFrom((entity) => entity.requiresCatering),
        ),
        forMember((dto) => dto.cateringNotes, mapFrom((entity) => entity.cateringNotes)),
        forMember((dto) => dto.requiresSetup, mapFrom((entity) => entity.requiresSetup)),
        forMember((dto) => dto.setupNotes, mapFrom((entity) => entity.setupNotes)),
        forMember(
          (dto) => dto.cancellationReason,
          mapFrom((entity) => entity.cancellationReason),
        ),
        forMember(
          (dto) => dto.rejectionReason,
          mapFrom((entity) => entity.rejectionReason),
        ),
        forMember((dto) => dto.approvedAt, mapFrom((entity) => entity.approvedAt)),
        forMember((dto) => dto.rejectedAt, mapFrom((entity) => entity.rejectedAt)),
        forMember(
          (dto) => dto.boardroom,
          mapFrom((entity) =>
            entity.boardroom
              ? mapper.map(entity.boardroom, Boardroom, BookingBoardroomResponseDto)
              : null,
          ),
        ),
        forMember(
          (dto) => dto.bookedByUser,
          mapFrom((entity) =>
            entity.bookedByUser
              ? mapper.map(entity.bookedByUser, User, BookingUserResponseDto)
              : null,
          ),
        ),
        forMember(
          (dto) => dto.approvedByUser,
          mapFrom((entity) =>
            entity.approvedByUser
              ? mapper.map(entity.approvedByUser, User, BookingUserResponseDto)
              : undefined,
          ),
        ),
        forMember(
          (dto) => dto.rejectedByUser,
          mapFrom((entity) =>
            entity.rejectedByUser
              ? mapper.map(entity.rejectedByUser, User, BookingUserResponseDto)
              : undefined,
          ),
        ),
        forMember((dto) => dto.createdAt, mapFrom((entity) => entity.createdAt)),
        forMember((dto) => dto.updatedAt, mapFrom((entity) => entity.updatedAt)),
      );

      createMap(mapper, Boardroom, BoardroomAvailabilityResponseDto);
    };
  }
}
