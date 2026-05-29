import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { DashboardService } from "./dashboard.service";

@ApiTags("Dashboard")
@ApiBearerAuth()
@Controller("dashboard")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get dashboard summary cards" })
  summary() {
    return this.dashboardService.summary();
  }

  @Get("room-utilisation")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get room utilisation report" })
  roomUtilisation() {
    return this.dashboardService.roomUtilisation();
  }

  @Get("bookings-by-status")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get booking counts by status" })
  bookingsByStatus() {
    return this.dashboardService.bookingsByStatus();
  }

  @Get("bookings-by-department")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Get booking volume grouped by department" })
  bookingsByDepartment() {
    return this.dashboardService.bookingsByDepartment();
  }

  @Get("peak-hours")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get peak booking hours" })
  peakHours() {
    return this.dashboardService.peakHours();
  }

  @Get("most-used-rooms")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get most used rooms" })
  mostUsedRooms() {
    return this.dashboardService.mostUsedRooms();
  }
}
