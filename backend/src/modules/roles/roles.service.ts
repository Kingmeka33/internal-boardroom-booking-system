import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./role.entity";
@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private repo: Repository<Role>) {}
  async findAll(): Promise<Role[]> {
    try {
      return this.repo.find();
    } catch (e) {
      throw e;
    }
  }
  async create(payload: any): Promise<Role | Role[]> {
    try {
      const entity = this.repo.create(payload);
      return this.repo.save(entity);
    } catch (e) {
      throw e;
    }
  }
}
