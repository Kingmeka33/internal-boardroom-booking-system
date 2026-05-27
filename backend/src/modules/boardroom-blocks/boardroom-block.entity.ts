import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Boardroom } from "../boardrooms/boardroom.entity";
import { User } from "../users/user.entity";
@Entity("boardroom_blocks")
export class BoardroomBlock {
  @PrimaryGeneratedColumn("uuid") id: string;
  @ManyToOne(() => Boardroom, { eager: true }) boardroom: Boardroom;
  @Column() reason: string;
  @Column({ type: "timestamptz" }) startDateTime: Date;
  @Column({ type: "timestamptz" }) endDateTime: Date;
  @ManyToOne(() => User, { eager: true }) createdByUser: User;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
