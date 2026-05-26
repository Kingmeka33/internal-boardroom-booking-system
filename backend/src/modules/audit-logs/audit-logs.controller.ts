import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { AuditLogsService } from "./audit-logs.service";

@ApiTags("Audit Logs")
@ApiBearerAuth()
@Controller("audit-logs")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Search and view audit logs" })
  findAll(@Query() query: Record<string, string>) {
    return this.auditLogsService.findAll(query);
  }
}
