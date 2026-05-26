import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { Role } from "../roles/role.entity";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Role) private roles: Repository<Role>,
  ) {}
  async findAll() {
    try {
      return this.users.find({ order: { createdAt: "DESC" } });
    } catch (e) {
      throw e;
    }
  }
  async findOne(id: string) {
    try {
      const u = await this.users.findOne({ where: { id } });
      if (!u) throw new NotFoundException("User not found");
      return u;
    } catch (e) {
      throw e;
    }
  }
  async create(dto: CreateUserDto) {
    try {
      const role = await this.roles.findOne({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException("Role not found");
      const user = this.users.create({
        ...dto,
        password: await bcrypt.hash(dto.password, 10),
        role,
      });
      return this.users.save(user);
    } catch (e) {
      throw e;
    }
  }
  async deactivate(id: string) {
    try {
      const u = await this.findOne(id);
      u.isActive = false;
      return this.users.save(u);
    } catch (e) {
      throw e;
    }
  }
  async assignRole(id: string, roleId: string) {
    try {
      const u = await this.findOne(id);
      const role = await this.roles.findOne({ where: { id: roleId } });
      if (!role) throw new NotFoundException("Role not found");
      u.role = role;
      return this.users.save(u);
    } catch (e) {
      throw e;
    }
  }
}
