import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Role } from "../roles/role.entity";
@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ unique: true }) code: string;
  @Column({ nullable: true }) description?: string;
  @ManyToMany(() => Role, (r) => r.permissions)
  @JoinTable({ name: "role_permissions" })
  roles: Role[];
}
