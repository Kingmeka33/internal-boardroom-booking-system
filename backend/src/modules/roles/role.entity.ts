import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Permission } from "../permissions/permission.entity";
import { User } from "../users/user.entity";
@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ unique: true }) name: string;
  @Column({ nullable: true }) description?: string;
  @Column({ default: false }) isSystemRole: boolean;
  @ManyToMany(() => Permission, (p) => p.roles)
  permissions: Permission[];
  @OneToMany(() => User, (u) => u.role) users: User[];
}
