import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BookingStatus } from "../../shared/enums/booking-status.enum";
import { Boardroom } from "../boardrooms/boardroom.entity";
import { User } from "../users/user.entity";
@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid") id: string;
  @ManyToOne(() => Boardroom, { eager: true }) boardroom: Boardroom;
  @ManyToOne(() => User, { eager: true }) bookedByUser: User;
  @Column() title: string;
  @Column({ nullable: true }) description?: string;
  @Column({ type: "timestamptz" }) startDateTime: Date;
  @Column({ type: "timestamptz" }) endDateTime: Date;
  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.APPROVED,
  })
  status: BookingStatus;
  @Column({ nullable: true }) meetingType?: string;
  @Column() attendeeCount: number;
  @Column({ default: false }) requiresCatering: boolean;
  @Column({ nullable: true }) cateringNotes?: string;
  @Column({ default: false }) requiresSetup: boolean;
  @Column({ nullable: true }) setupNotes?: string;
  @Column({ nullable: true }) cancellationReason?: string;
  @ManyToOne(() => User, { nullable: true, eager: true }) approvedByUser?: User;
  @ManyToOne(() => User, { nullable: true, eager: true }) rejectedByUser?: User;
  @Column({ nullable: true }) rejectionReason?: string;
  @Column({ type: "timestamptz", nullable: true }) approvedAt?: Date;
  @Column({ type: "timestamptz", nullable: true }) rejectedAt?: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
