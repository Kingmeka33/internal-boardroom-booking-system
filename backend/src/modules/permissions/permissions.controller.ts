import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { PermissionsService } from "./permissions.service";
@ApiTags("Permissions")
@ApiBearerAuth()
@Controller("permissions")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class PermissionsController {
  constructor(private svc: PermissionsService) {}
  @Get() findAll() {
    return this.svc.findAll();
  }
  @Post() @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN) create(
    @Body() dto: any,
  ) {
    return this.svc.create(dto);
  }
}
