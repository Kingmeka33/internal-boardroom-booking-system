import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "./permission.entity";
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private repo: Repository<Permission>,
  ) {}
  async findAll(): Promise<Permission[]> {
    try {
      return this.repo.find();
    } catch (e) {
      throw e;
    }
  }
  async create(payload: any): Promise<Permission | Permission[]> {
    try {
      const entity = this.repo.create(payload);
      return this.repo.save(entity);
    } catch (e) {
      throw e;
    }
  }
}
