import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Boardroom } from "../boardrooms/boardroom.entity";
import { Booking } from "../bookings/booking.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
    @InjectRepository(Boardroom)
    private readonly rooms: Repository<Boardroom>,
  ) {}

  async summary(): Promise<any> {
    try {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        totalBoardrooms: await this.rooms.count(),
        activeBoardrooms: await this.rooms.count({ where: { isActive: true } }),
        bookingsToday: await this.countBookingsSince(startOfToday),
        bookingsThisWeek: await this.countBookingsSince(startOfWeek),
        bookingsThisMonth: await this.countBookingsSince(startOfMonth),
        pendingApprovals: await this.bookings.count({
          where: { status: "PENDING_APPROVAL" as any },
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  private async countBookingsSince(date: Date) {
    return this.bookings
      .createQueryBuilder("booking")
      .where("booking.startDateTime >= :date", { date })
      .getCount();
  }

  async bookingsByStatus(): Promise<{ status: string; count: number }[]> {
    try {
      return this.bookings
        .createQueryBuilder("booking")
        .select("booking.status", "status")
        .addSelect("COUNT(*)", "count")
        .groupBy("booking.status")
        .orderBy("count", "DESC")
        .getRawMany();
    } catch (error) {
      throw error;
    }
  }

  async roomUtilisation(): Promise<{ room: string; bookingCount: number; minutesBooked: number }[]> {
    try {
      return this.bookings
        .createQueryBuilder("booking")
        .leftJoin("booking.boardroom", "room")
        .select("room.name", "room")
        .addSelect("COUNT(*)", "bookingCount")
        .addSelect(
          "SUM(EXTRACT(EPOCH FROM (booking.endDateTime - booking.startDateTime)) / 60)",
          "minutesBooked",
        )
        .groupBy("room.name")
        .orderBy("bookingCount", "DESC")
        .getRawMany();
    } catch (error) {
      throw error;
    }
  }

  async bookingsByDepartment(): Promise<{ department: string; count: number }[]> {
    try {
      return this.bookings
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.bookedByUser", "user")
        .select("COALESCE(user.department, :unknown)", "department")
        .setParameter("unknown", "Unassigned")
        .addSelect("COUNT(*)", "count")
        .groupBy("user.department")
        .orderBy("count", "DESC")
        .getRawMany();
    } catch (error) {
      throw error;
    }
  }

  async peakHours(): Promise<{ hour: number; count: number }[]> {
    try {
      return this.bookings
        .createQueryBuilder("booking")
        .select("EXTRACT(HOUR FROM booking.startDateTime)", "hour")
        .addSelect("COUNT(*)", "count")
        .groupBy("hour")
        .orderBy("count", "DESC")
        .getRawMany();
    } catch (error) {
      throw error;
    }
  }

  async mostUsedRooms(): Promise<{ room: string; bookingCount: number; minutesBooked: number }[]> {
    try {
      return this.roomUtilisation();
    } catch (error) {
      throw error;
    }
  }
}
