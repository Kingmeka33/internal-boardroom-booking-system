import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users/user.entity";
@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid") id: string;
  @ManyToOne(() => User, { eager: true }) user: User;
  @Column() title: string;
  @Column() message: string;
  @Column({ default: "INFO" }) type: string;
  @Column({ default: false }) isRead: boolean;
  @Column({ type: "jsonb", nullable: true }) metadata?: Record<string, unknown>;
  @CreateDateColumn() createdAt: Date;
}
