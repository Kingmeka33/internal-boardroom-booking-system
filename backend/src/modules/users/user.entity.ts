import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../roles/role.entity";
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() firstName: string;
  @Column() lastName: string;
  @Column({ unique: true }) email: string;
  @Column() password: string;
  @Column({ nullable: true }) phoneNumber?: string;
  @Column({ nullable: true }) department?: string;
  @Column({ nullable: true }) jobTitle?: string;
  @ManyToOne(() => Role, (r) => r.users) role: Role;
  @Column({ default: true }) isActive: boolean;
  @Column({ nullable: true }) refreshTokenHash?: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}