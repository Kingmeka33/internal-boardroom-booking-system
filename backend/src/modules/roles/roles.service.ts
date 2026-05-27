import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./role.entity";
@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private repo: Repository<Role>) {}
  async findAll() {
    try {
      return this.repo.find();
    } catch (e) {
      throw e;
    }
  }
  async create(payload: any) {
    try {
      return this.repo.save(this.repo.create(payload));
    } catch (e) {
      throw e;
    }
  }
}
