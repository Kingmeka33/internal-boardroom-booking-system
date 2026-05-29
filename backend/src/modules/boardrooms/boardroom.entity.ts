import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Amenity } from "../amenities/amenity.entity";
@Entity("boardrooms")
export class Boardroom {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() name: string;
  @Column({ unique: true }) code: string;
  @Column({ nullable: true }) description?: string;
  @Column() location: string;
  @Column({ nullable: true }) floor?: string;
  @Column({ nullable: true }) building?: string;
  @Column() capacity: number;
  @Column({ nullable: true }) imageUrl?: string;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: true }) isBookable: boolean;
  @Column({ default: false }) requiresApproval: boolean;
  @Column({ default: "08:00" }) openingTime: string;
  @Column({ default: "17:00" }) closingTime: string;
  @Column({ default: 15 }) minimumBookingMinutes: number;
  @Column({ default: 240 }) maximumBookingMinutes: number;
  @Column({ default: 0 }) bufferTimeBeforeMinutes: number;
  @Column({ default: 0 }) bufferTimeAfterMinutes: number;
  @ManyToMany(() => Amenity)
  @JoinTable({ name: "boardroom_amenities" })
  amenities: Amenity[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
