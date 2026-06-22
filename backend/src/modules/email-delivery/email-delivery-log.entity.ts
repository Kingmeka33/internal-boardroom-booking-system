import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("email_delivery_logs")
export class EmailDeliveryLog {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() recipient: string;
  @Column({ nullable: true }) recipientName?: string;
  @Column() subject: string;
  @Column({ type: "text" }) body: string;
  @Column() type: string;
  @Column({ default: "PENDING" }) status: "PENDING" | "SENT" | "FAILED";
  @Column({ default: 0 }) attempts: number;
  @Column({ type: "text", nullable: true }) lastError?: string;
  @Column({ type: "jsonb", nullable: true }) metadata?: Record<string, unknown>;
  @Column({ type: "timestamptz", nullable: true }) nextAttemptAt?: Date;
  @Column({ type: "timestamptz", nullable: true }) sentAt?: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
