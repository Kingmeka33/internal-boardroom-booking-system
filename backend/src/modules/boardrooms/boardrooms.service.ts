import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Amenity } from "../amenities/amenity.entity";
import { BoardroomBlock } from "../boardroom-blocks/boardroom-block.entity";
import { Booking } from "../bookings/booking.entity";
import { BookingStatus } from "../../shared/enums/booking-status.enum";
import { Boardroom } from "./boardroom.entity";
import { CreateBoardroomDto } from "./dto/create-boardroom.dto";

@Injectable()
export class BoardroomsService {
  constructor(
    @InjectRepository(Boardroom) private readonly rooms: Repository<Boardroom>,
    @InjectRepository(Amenity) private readonly amenities: Repository<Amenity>,
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(BoardroomBlock)
    private readonly blocks: Repository<BoardroomBlock>,
  ) {}

  async findAll() {
    try {
      return this.rooms.find({ order: { name: "ASC" } });
    } catch (error) {
      throw error;
    }
  }

  async available(query: Record<string, string>) {
    try {
      if (!query.startDateTime || !query.endDateTime) {
        throw new BadRequestException(
          "startDateTime and endDateTime are required",
        );
      }

      const start = new Date(query.startDateTime);
      const end = new Date(query.endDateTime);
      if (end <= start)
        throw new BadRequestException(
          "endDateTime must be after startDateTime",
        );

      const rooms = await this.rooms.find({
        where: { isActive: true, isBookable: true },
        order: { name: "ASC" },
      });
      const filteredRooms = rooms.filter((room) => {
        const capacityOk = query.capacity
          ? room.capacity >= Number(query.capacity)
          : true;
        const locationOk = query.location
          ? room.location.toLowerCase().includes(query.location.toLowerCase())
          : true;
        return capacityOk && locationOk;
      });

      const results = await Promise.all(
        filteredRooms.map(async (room) => {
          const reason = await this.unavailableReason(room.id, start, end);
          return { ...room, isAvailable: !reason, unavailableReason: reason };
        }),
      );

      return results.filter((room) => room.isAvailable);
    } catch (error) {
      throw error;
    }
  }

  async availability(id: string, date: string) {
    try {
      const room = await this.findOne(id);
      if (!date) throw new BadRequestException("date is required");

      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);

      const bookings = await this.bookings
        .createQueryBuilder("booking")
        .where("booking.boardroomId = :id", { id })
        .andWhere("booking.status IN (:...statuses)", {
          statuses: [BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED],
        })
        .andWhere("booking.startDateTime < :dayEnd", { dayEnd })
        .andWhere("booking.endDateTime > :dayStart", { dayStart })
        .orderBy("booking.startDateTime", "ASC")
        .getMany();

      const blocks = await this.blocks
        .createQueryBuilder("block")
        .where("block.boardroomId = :id", { id })
        .andWhere("block.isActive = true")
        .andWhere("block.startDateTime < :dayEnd", { dayEnd })
        .andWhere("block.endDateTime > :dayStart", { dayStart })
        .orderBy("block.startDateTime", "ASC")
        .getMany();

      return {
        boardroomId: room.id,
        boardroomName: room.name,
        date,
        openingTime: room.openingTime,
        closingTime: room.closingTime,
        bookings: bookings.map((booking) => ({
          id: booking.id,
          title: booking.title,
          start: booking.startDateTime,
          end: booking.endDateTime,
          status: booking.status,
        })),
        blocks: blocks.map((block) => ({
          id: block.id,
          reason: block.reason,
          start: block.startDateTime,
          end: block.endDateTime,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  private async unavailableReason(
    roomId: string,
    start: Date,
    end: Date,
  ): Promise<string | null> {
    const bookingConflict = await this.bookings
      .createQueryBuilder("booking")
      .where("booking.boardroomId = :roomId", { roomId })
      .andWhere("booking.status IN (:...statuses)", {
        statuses: [BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED],
      })
      .andWhere("booking.startDateTime < :end", { end })
      .andWhere("booking.endDateTime > :start", { start })
      .getOne();

    if (bookingConflict)
      return `Unavailable: ${bookingConflict.status.toLowerCase()} booking already exists`;

    const blockConflict = await this.blocks
      .createQueryBuilder("block")
      .where("block.boardroomId = :roomId", { roomId })
      .andWhere("block.isActive = true")
      .andWhere("block.startDateTime < :end", { end })
      .andWhere("block.endDateTime > :start", { start })
      .getOne();

    if (blockConflict)
      return `Unavailable: room block - ${blockConflict.reason}`;

    return null;
  }

  async findOne(id: string) {
    try {
      const room = await this.rooms.findOne({ where: { id } });
      if (!room) throw new NotFoundException("Boardroom not found");
      return room;
    } catch (error) {
      throw error;
    }
  }

  async create(dto: CreateBoardroomDto) {
    try {
      return this.rooms.save(this.rooms.create(dto));
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, dto: Partial<CreateBoardroomDto>) {
    try {
      const room = await this.findOne(id);
      Object.assign(room, dto);
      return this.rooms.save(room);
    } catch (error) {
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      const room = await this.findOne(id);
      room.isActive = false;
      room.isBookable = false;
      return this.rooms.save(room);
    } catch (error) {
      throw error;
    }
  }

  async assignAmenities(id: string, amenityIds: string[]) {
    try {
      const room = await this.findOne(id);
      room.amenities = await this.amenities.find({
        where: { id: In(amenityIds) },
      });
      return this.rooms.save(room);
    } catch (error) {
      throw error;
    }
  }
}
