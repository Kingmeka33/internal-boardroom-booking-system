import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity("amenities")
export class Amenity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) description?: string;
  @Column({ nullable: true }) icon?: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
