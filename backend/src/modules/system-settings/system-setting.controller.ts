import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { SystemSettingsService } from "./system-settings.service";
import { SystemSettingResponseDto } from "./dto/system-setting-response.dto";

class UpdateSettingDto {
  @ApiProperty({
    example: "yes",
    description: "Setting value. Use yes/no for boolean settings or a number for numeric settings.",
  })
  @IsNotEmpty()
  @IsString()
  value: string;
}

@ApiTags("System Settings")
@ApiBearerAuth()
@Controller("system-settings")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all system settings" })
  @ApiOkResponse({
    type: [SystemSettingResponseDto],
    description: "Returns all system settings.",
  })
  async findAll(): Promise<SystemSettingResponseDto[]> {
    try {
      return await this.systemSettingsService.findAll();
    } catch (e) {
      throw e;
    }
  }

  @Patch(":key")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Update a system setting by key" })
  @ApiBody({ type: UpdateSettingDto })
  @ApiOkResponse({
    type: SystemSettingResponseDto,
    description: "Setting updated successfully.",
  })
  async update(
    @Param("key") key: string,
    @Body() dto: UpdateSettingDto,
  ): Promise<SystemSettingResponseDto> {
    try {
      return await this.systemSettingsService.update(key, dto.value);
    } catch (e) {
      throw e;
    }
  }
}