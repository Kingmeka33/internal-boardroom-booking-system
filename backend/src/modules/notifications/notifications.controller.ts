import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { User } from "../users/user.entity";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(AuthGuard("jwt"))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get notifications for the signed-in user" })
  findMine(@CurrentUser() user: User) {
    return this.notificationsService.findForUser(user);
  }

  @Get("unread-count")
  @ApiOperation({
    summary: "Get unread notification count for the signed-in user",
  })
  unreadCount(@CurrentUser() user: User) {
    return this.notificationsService.unreadCount(user);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markRead(@Param("id") id: string, @CurrentUser() user: User) {
    return this.notificationsService.markRead(id, user);
  }

  @Patch("mark-all-read")
  @ApiOperation({ summary: "Mark all signed-in user notifications as read" })
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user);
  }
}
