import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemSetting } from "./system-setting.entity";

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settings: Repository<SystemSetting>,
  ) {}

  async findAll(): Promise<SystemSetting[]> {
    try {
      return this.settings.find({ order: { key: "ASC" } });
    } catch (error) {
      throw error;
    }
  }

  async getValue(key: string, fallback?: string): Promise<string | undefined> {
    try {
      const setting = await this.settings.findOne({ where: { key } });
      return setting?.value ?? fallback;
    } catch (error) {
      throw error;
    }
  }

  async update(key: string, value: string): Promise<SystemSetting> {
    try {
      const setting = await this.settings.findOne({ where: { key } });

      if (!setting) {
        throw new NotFoundException("System setting not found");
      }

      setting.value = value;
      return this.settings.save(setting);
    } catch (error) {
      throw error;
    }
  }
}
