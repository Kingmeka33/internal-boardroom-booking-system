import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ nullable: true }) actorUserId?: string;
  @Column() action: string;
  @Column() entityName: string;
  @Column({ nullable: true }) entityId?: string;
  @Column({ type: "jsonb", nullable: true }) before?: Record<string, unknown>;
  @Column({ type: "jsonb", nullable: true }) after?: Record<string, unknown>;
  @Column({ nullable: true }) ipAddress?: string;
  @Column({ nullable: true }) userAgent?: string;
  @CreateDateColumn() createdAt: Date;
}
