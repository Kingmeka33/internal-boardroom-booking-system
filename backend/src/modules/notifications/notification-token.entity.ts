import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import {
  NotificationTokenPlatform,
  NotificationTokenProvider,
} from "./notification.enums";

@Entity("notification_token")
@Index(["user", "platform", "token"])
@Index(["user", "platform", "endpoint"])
export class NotificationToken {
  @PrimaryGeneratedColumn("uuid") id: string;

  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" }) user: User;

  @Column({ type: "varchar" }) platform: NotificationTokenPlatform;

  @Column({ type: "varchar" }) provider: NotificationTokenProvider;

  @Column({ nullable: true }) token?: string;

  @Column({ nullable: true }) endpoint?: string;

  @Column({ nullable: true }) p256dh?: string;

  @Column({ nullable: true }) auth?: string;

  @Column({ nullable: true }) deviceId?: string;

  @Column({ nullable: true }) userAgent?: string;

  @Column({ nullable: true }) appVersion?: string;

  @Column({ default: true }) isActive: boolean;

  @Column({ default: 0 }) failureCount: number;

  @Column({ nullable: true }) lastError?: string;

  @Column({ type: "timestamptz", nullable: true }) lastRegisteredAt?: Date;

  @Column({ type: "timestamptz", nullable: true }) lastUsedAt?: Date;

  @Column({ type: "timestamptz", nullable: true }) invalidatedAt?: Date;

  @CreateDateColumn() createdAt: Date;

  @UpdateDateColumn() updatedAt: Date;
}
