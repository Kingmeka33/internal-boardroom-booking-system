import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { SystemSettingsService } from "./system-settings.service";

class UpdateSettingDto {
  @ApiProperty({ example: "false" })
  @IsNotEmpty()
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
  findAll() {
    return this.systemSettingsService.findAll();
  }

  @Patch(":key")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Update a system setting by key" })
  update(@Param("key") key: string, @Body() dto: UpdateSettingDto) {
    return this.systemSettingsService.update(key, dto.value);
  }
}
