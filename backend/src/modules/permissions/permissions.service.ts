import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "./permission.entity";
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private repo: Repository<Permission>,
  ) {}
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
