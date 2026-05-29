import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemSetting } from "./system-setting.entity";
import { SystemSettingResponseDto } from "./dto/system-setting-response.dto";

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settings: Repository<SystemSetting>,
  ) {}

  async findAll(): Promise<SystemSettingResponseDto[]> {
    try {
      const results = await this.settings.find({ order: { key: "ASC" } });
      return results.map((s) => this.toResponseDto(s));
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

  async update(key: string, value: string): Promise<SystemSettingResponseDto> {
    try {
      const setting = await this.settings.findOne({ where: { key } });

      if (!setting) {
        throw new NotFoundException("System setting not found");
      }

      setting.value = this.normalizeValue(value);
      const saved = await this.settings.save(setting);
      return this.toResponseDto(saved);
    } catch (error) {
      throw error;
    }
  }

  private normalizeValue(value: string): string {
    if (value.toLowerCase() === "true") return "yes";
    if (value.toLowerCase() === "false") return "no";
    return value;
  }

  private toResponseDto(setting: SystemSetting): SystemSettingResponseDto {
    return {
      key: setting.key,
      value: this.normalizeValue(setting.value),
      description: setting.description,
    };
  }
}