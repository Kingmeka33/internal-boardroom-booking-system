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
import { IsNotEmpty } from "class-validator";
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
  @ApiOkResponse({
    type: [SystemSettingResponseDto],
    description: "Returns all system settings.",
  })

  @Patch(":key")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Update a system setting by key" })
  @ApiBody({ type: UpdateSettingDto })
  @ApiOkResponse({
    type: SystemSettingResponseDto,
    description: "Setting updated successfully.",
  })

  update(@Param("key") key: string, @Body() dto: UpdateSettingDto) {
    return this.systemSettingsService.update(key, dto.value);
  }
}
