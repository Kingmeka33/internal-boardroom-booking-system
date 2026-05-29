import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "../audit-logs/audit-log.entity";
import { BoardroomBlock } from "../boardroom-blocks/boardroom-block.entity";
import { Boardroom } from "../boardrooms/boardroom.entity";
import { Notification } from "../notifications/notification.entity";
import { SystemSetting } from "../system-settings/system-setting.entity";
import { User } from "../users/user.entity";
import { BookingStatus } from "../../shared/enums/booking-status.enum";
import { Booking } from "./booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    @InjectRepository(Boardroom)
    private readonly rooms: Repository<Boardroom>,
    @InjectRepository(BoardroomBlock)
    private readonly blocks: Repository<BoardroomBlock>,
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(SystemSetting)
    private readonly settings: Repository<SystemSetting>,
  ) {}

  async create(dto: CreateBookingDto, user: User): Promise<Booking> {
    try {
      const room = await this.rooms.findOne({ where: { id: dto.boardroomId } });
      if (!room) throw new NotFoundException("Boardroom not found");

      const start = new Date(dto.startDateTime);
      const end = new Date(dto.endDateTime);

      await this.validateBookingBasics(dto, room, start, end);
      await this.validateOperatingRules(room, start, end);

      const conflictWindow = this.applyBufferWindow(room, start, end);
      await this.validateNoConflicts(
        room.id,
        conflictWindow.start,
        conflictWindow.end,
      );

      const booking = this.bookings.create({
        ...dto,
        boardroom: room,
        bookedByUser: user,
        startDateTime: start,
        endDateTime: end,
        status: room.requiresApproval
          ? BookingStatus.PENDING_APPROVAL
          : BookingStatus.APPROVED,
      });

      const saved = await this.bookings.save(booking);

      await this.notifyUser(
        user,
        "Booking created",
        room.requiresApproval
          ? `Your booking for ${room.name} is pending approval.`
          : `Your booking for ${room.name} has been approved.`,
        "BOOKING_CREATED",
        { bookingId: saved.id },
      );

      if (room.requiresApproval) {
        await this.notifyOperationalUsers(
          "Booking requires approval",
          `${user.firstName} ${user.lastName} requested ${room.name}.`,
          "BOOKING_APPROVAL_REQUIRED",
          { bookingId: saved.id, boardroomId: room.id },
        );
      }

      await this.audit(
        user,
        "BOOKING_CREATED",
        "Booking",
        saved.id,
        null,
        this.safeBooking(saved),
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  private async validateBookingBasics(
    dto: CreateBookingDto,
    room: Boardroom,
    start: Date,
    end: Date,
  ) {
    if (!dto.title?.trim())
      throw new BadRequestException("Booking title is required");
    if (!room.isActive || !room.isBookable)
      throw new BadRequestException("Boardroom is not bookable");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException("Start and end date-times are required");
    }
    if (end <= start)
      throw new BadRequestException(
        "End date-time must be after start date-time",
      );
    if (start < new Date())
      throw new BadRequestException("Booking cannot start in the past");
    if (dto.attendeeCount > room.capacity)
      throw new BadRequestException(
        "Attendee count exceeds boardroom capacity",
      );

    const minutes = (end.getTime() - start.getTime()) / 60000;
    if (
      minutes < room.minimumBookingMinutes ||
      minutes > room.maximumBookingMinutes
    ) {
      throw new BadRequestException(
        "Booking duration is outside allowed limits",
      );
    }
  }

  private async validateOperatingRules(
    room: Boardroom,
    start: Date,
    end: Date,
  ) {
    const allowWeekendBookings = await this.getBooleanSetting(
      "ALLOW_WEEKEND_BOOKINGS",
      false,
    );
    const allowAfterHoursBookings = await this.getBooleanSetting(
      "ALLOW_AFTER_HOURS_BOOKINGS",
      false,
    );

    const isWeekend =
      [0, 6].includes(start.getDay()) || [0, 6].includes(end.getDay());
    if (!allowWeekendBookings && isWeekend) {
      throw new BadRequestException("Weekend bookings are not allowed");
    }

    if (!allowAfterHoursBookings) {
      const startTime = start.toTimeString().substring(0, 5);
      const endTime = end.toTimeString().substring(0, 5);

      if (startTime < room.openingTime || endTime > room.closingTime) {
        throw new BadRequestException(
          "Booking is outside boardroom operating hours",
        );
      }
    }
  }

  private applyBufferWindow(room: Boardroom, start: Date, end: Date) {
    return {
      start: new Date(start.getTime() - room.bufferTimeBeforeMinutes * 60000),
      end: new Date(end.getTime() + room.bufferTimeAfterMinutes * 60000),
    };
  }

  async validateNoConflicts(
    boardroomId: string,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ): Promise<void> {
    try {
      const bookingQuery = this.bookings
        .createQueryBuilder("booking")
        .where("booking.boardroomId = :boardroomId", { boardroomId })
        .andWhere("booking.status IN (:...statuses)", {
          statuses: [BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED],
        })
        .andWhere("booking.startDateTime < :end", { end })
        .andWhere("booking.endDateTime > :start", { start });

      if (excludeBookingId) {
        bookingQuery.andWhere("booking.id != :excludeBookingId", {
          excludeBookingId,
        });
      }

      const conflicts = await bookingQuery.getCount();
      if (conflicts > 0)
        throw new BadRequestException(
          "Booking conflicts with an existing active booking",
        );

      const blockConflicts = await this.blocks
        .createQueryBuilder("block")
        .where("block.boardroomId = :boardroomId", { boardroomId })
        .andWhere("block.isActive = true")
        .andWhere("block.startDateTime < :end", { end })
        .andWhere("block.endDateTime > :start", { start })
        .getCount();

      if (blockConflicts > 0)
        throw new BadRequestException(
          "Booking conflicts with an active room block",
        );
    } catch (error) {
      throw error;
    }
  }

  async myBookings(user: User): Promise<Booking[]> {
    try {
      return this.bookings.find({
        where: { bookedByUser: { id: user.id } },
        order: { startDateTime: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: Record<string, string> = {}): Promise<Booking[]> {
    try {
      const qb = this.bookings
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.boardroom", "boardroom")
        .leftJoinAndSelect("booking.bookedByUser", "bookedByUser");

      if (query.status)
        qb.andWhere("booking.status = :status", { status: query.status });
      if (query.boardroomId)
        qb.andWhere("booking.boardroomId = :boardroomId", {
          boardroomId: query.boardroomId,
        });
      if (query.startDateTime)
        qb.andWhere("booking.endDateTime >= :startDateTime", {
          startDateTime: query.startDateTime,
        });
      if (query.endDateTime)
        qb.andWhere("booking.startDateTime <= :endDateTime", {
          endDateTime: query.endDateTime,
        });

      return qb.orderBy("booking.startDateTime", "DESC").getMany();
    } catch (error) {
      throw error;
    }
  }

  async calendar(query: Record<string, string> = {}): Promise<any[]> {
    try {
      const bookings = await this.findAll(query);
      return bookings.map((booking) => ({
        id: booking.id,
        title: booking.title,
        start: booking.startDateTime,
        end: booking.endDateTime,
        status: booking.status,
        boardroomId: booking.boardroom?.id,
        boardroom: booking.boardroom?.name,
        owner:
          `${booking.bookedByUser?.firstName || ""} ${booking.bookedByUser?.lastName || ""}`.trim(),
      }));
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<Booking> {
    try {
      const booking = await this.bookings.findOne({ where: { id } });
      if (!booking) throw new NotFoundException("Booking not found");
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, dto: Partial<CreateBookingDto>, user: User): Promise<Booking> {
    try {
      const booking = await this.findOne(id);
      const before = this.safeBooking(booking);

      if (
        user.role.name === "EMPLOYEE" &&
        booking.bookedByUser.id !== user.id
      ) {
        throw new ForbiddenException("You can only update your own bookings");
      }

      if (
        ![BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED].includes(
          booking.status,
        )
      ) {
        throw new BadRequestException(
          "Only pending or approved bookings can be updated",
        );
      }

      const room = dto.boardroomId
        ? await this.rooms.findOne({ where: { id: dto.boardroomId } })
        : booking.boardroom;
      if (!room) throw new NotFoundException("Boardroom not found");

      const start = dto.startDateTime
        ? new Date(dto.startDateTime)
        : booking.startDateTime;
      const end = dto.endDateTime
        ? new Date(dto.endDateTime)
        : booking.endDateTime;
      const attendeeCount = dto.attendeeCount ?? booking.attendeeCount;

      await this.validateBookingBasics(
        { ...(booking as any), ...dto, attendeeCount } as CreateBookingDto,
        room,
        start,
        end,
      );
      await this.validateOperatingRules(room, start, end);
      const conflictWindow = this.applyBufferWindow(room, start, end);
      await this.validateNoConflicts(
        room.id,
        conflictWindow.start,
        conflictWindow.end,
        booking.id,
      );

      Object.assign(booking, {
        ...dto,
        boardroom: room,
        startDateTime: start,
        endDateTime: end,
        attendeeCount,
        status: room.requiresApproval
          ? BookingStatus.PENDING_APPROVAL
          : booking.status,
      });

      const saved = await this.bookings.save(booking);
      await this.notifyUser(
        saved.bookedByUser,
        "Booking updated",
        `Your booking ${saved.title} was updated.`,
        "BOOKING_UPDATED",
        { bookingId: saved.id },
      );
      await this.audit(
        user,
        "BOOKING_UPDATED",
        "Booking",
        saved.id,
        before,
        this.safeBooking(saved),
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async approve(id: string, user: User): Promise<Booking> {
    try {
      const booking = await this.findOne(id);
      const before = this.safeBooking(booking);
      if (booking.status !== BookingStatus.PENDING_APPROVAL) {
        throw new BadRequestException(
          "Only pending approval bookings can be approved",
        );
      }
      await this.validateNoConflicts(
        booking.boardroom.id,
        booking.startDateTime,
        booking.endDateTime,
        booking.id,
      );
      booking.status = BookingStatus.APPROVED;
      booking.approvedByUser = user;
      booking.approvedAt = new Date();
      const saved = await this.bookings.save(booking);
      await this.notifyUser(
        saved.bookedByUser,
        "Booking approved",
        `Your booking ${saved.title} was approved.`,
        "BOOKING_APPROVED",
        { bookingId: saved.id },
      );
      await this.audit(
        user,
        "BOOKING_APPROVED",
        "Booking",
        saved.id,
        before,
        this.safeBooking(saved),
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async reject(id: string, user: User, reason: string): Promise<Booking> {
    try {
      const booking = await this.findOne(id);
      const before = this.safeBooking(booking);
      if (!reason?.trim())
        throw new BadRequestException("Rejection reason is required");
      if (booking.status !== BookingStatus.PENDING_APPROVAL) {
        throw new BadRequestException(
          "Only pending approval bookings can be rejected",
        );
      }
      booking.status = BookingStatus.REJECTED;
      booking.rejectedByUser = user;
      booking.rejectionReason = reason;
      booking.rejectedAt = new Date();
      const saved = await this.bookings.save(booking);
      await this.notifyUser(
        saved.bookedByUser,
        "Booking rejected",
        `Your booking ${saved.title} was rejected: ${reason}`,
        "BOOKING_REJECTED",
        { bookingId: saved.id },
      );
      await this.audit(
        user,
        "BOOKING_REJECTED",
        "Booking",
        saved.id,
        before,
        this.safeBooking(saved),
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async cancel(id: string, user: User, reason?: string): Promise<Booking> {
    try {
      const booking = await this.findOne(id);
      const before = this.safeBooking(booking);

      if (
        user.role.name === "EMPLOYEE" &&
        booking.bookedByUser.id !== user.id
      ) {
        throw new ForbiddenException("You can only cancel your own bookings");
      }

      if (
        [
          BookingStatus.CANCELLED,
          BookingStatus.REJECTED,
          BookingStatus.COMPLETED,
          BookingStatus.NO_SHOW,
        ].includes(booking.status)
      ) {
        throw new BadRequestException(
          "This booking can no longer be cancelled",
        );
      }

      booking.status = BookingStatus.CANCELLED;
      booking.cancellationReason = reason || "Cancelled";
      const saved = await this.bookings.save(booking);
      await this.notifyUser(
        saved.bookedByUser,
        "Booking cancelled",
        `Your booking ${saved.title} was cancelled.`,
        "BOOKING_CANCELLED",
        { bookingId: saved.id },
      );
      await this.notifyOperationalUsers(
        "Booking cancelled",
        `${saved.title} was cancelled.`,
        "BOOKING_CANCELLED",
        { bookingId: saved.id },
      );
      await this.audit(
        user,
        "BOOKING_CANCELLED",
        "Booking",
        saved.id,
        before,
        this.safeBooking(saved),
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async complete(id: string, user?: User): Promise<Booking> {
    try {
      const booking = await this.findOne(id);
      const before = this.safeBooking(booking);
      if (booking.status !== BookingStatus.APPROVED) {
        throw new BadRequestException(
          "Only approved bookings can be completed",
        );
      }
      booking.status = BookingStatus.COMPLETED;
      const saved = await this.bookings.save(booking);
      await this.audit(
        user || null,
        "BOOKING_COMPLETED",
        "Booking",
        saved.id,
        before,
        this.safeBooking(saved),
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async noShow(id: string, user?: User) {
    try {
      const booking = await this.findOne(id);
      const before = this.safeBooking(booking);
      if (booking.status !== BookingStatus.APPROVED) {
        throw new BadRequestException(
          "Only approved bookings can be marked no-show",
        );
      }
      booking.status = BookingStatus.NO_SHOW;
      const saved = await this.bookings.save(booking);
      await this.audit(
        user || null,
        "BOOKING_NO_SHOW",
        "Booking",
        saved.id,
        before,
        this.safeBooking(saved),
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  private async notifyUser(
    user: User,
    title: string,
    message: string,
    type: string,
    metadata?: Record<string, unknown>,
  ) {
    if (!user?.id) return;
    await this.notifications.save(
      this.notifications.create({ user, title, message, type, metadata }),
    );
  }

  private async notifyOperationalUsers(
    title: string,
    message: string,
    type: string,
    metadata?: Record<string, unknown>,
  ) {
    const users = await this.users
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("role.name IN (:...roles)", {
        roles: ["ADMIN", "SUPER_ADMIN", "FACILITIES_MANAGER"],
      })
      .getMany();

    for (const user of users) {
      await this.notifyUser(user, title, message, type, metadata);
    }
  }

  private async audit(
    actor: User | null | undefined,
    action: string,
    entityName: string,
    entityId?: string,
    before?: Record<string, unknown> | null,
    after?: Record<string, unknown> | null,
  ) {
    await this.auditLogs.save(
      this.auditLogs.create({
        actorUserId: actor?.id,
        action,
        entityName,
        entityId,
        before: before || undefined,
        after: after || undefined,
      }),
    );
  }

  private safeBooking(booking: Booking): Record<string, unknown> {
    return {
      id: booking.id,
      title: booking.title,
      status: booking.status,
      boardroomId: booking.boardroom?.id,
      bookedByUserId: booking.bookedByUser?.id,
      startDateTime: booking.startDateTime,
      endDateTime: booking.endDateTime,
      attendeeCount: booking.attendeeCount,
    };
  }

  private async getBooleanSetting(key: string, fallback: boolean) {
    const setting = await this.settings.findOne({ where: { key } });
    if (!setting) return fallback;
    return setting.value.toLowerCase() === "true";
  }
}
