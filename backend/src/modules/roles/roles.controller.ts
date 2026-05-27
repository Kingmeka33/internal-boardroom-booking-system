import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { RolesService } from "./roles.service";
@ApiTags("Roles")
@ApiBearerAuth()
@Controller("roles")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class RolesController {
  constructor(private svc: RolesService) {}
  @Get() findAll() {
    return this.svc.findAll();
  }
  @Post() @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN) create(
    @Body() dto: any,
  ) {
    return this.svc.create(dto);
  }
}
