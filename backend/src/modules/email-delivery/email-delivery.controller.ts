import { Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { User } from "../users/user.entity";
import { EmailDeliveryConfigurationResponseDto } from "./dto/email-delivery-configuration-response.dto";
import { EmailDeliveryLogResponseDto } from "./dto/email-delivery-log-response.dto";
import { EmailDeliveryService } from "./email-delivery.service";

@ApiTags("Email Delivery")
@ApiBearerAuth()
@Controller("email-delivery")
@UseGuards(RolesGuard)
@Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
export class EmailDeliveryController {
  constructor(private readonly service: EmailDeliveryService) {}

  @Get()
  @ApiOperation({ summary: "Search email delivery logs" })
  @ApiQuery({ name: "status", required: false, example: "FAILED" })
  @ApiQuery({ name: "type", required: false, example: "BOOKING_CREATED_EMAIL" })
  @ApiQuery({ name: "recipient", required: false, example: "employee@boardroom.com" })
  @ApiOkResponse({ type: [EmailDeliveryLogResponseDto] })
  findAll(
    @Query() query: Record<string, string>,
  ): Promise<EmailDeliveryLogResponseDto[]> {
    return this.service.findAll(query);
  }

  @Get("configuration")
  @ApiOperation({ summary: "Check email delivery configuration" })
  @ApiOkResponse({ type: EmailDeliveryConfigurationResponseDto })
  configurationStatus(): EmailDeliveryConfigurationResponseDto {
    return this.service.configurationStatus();
  }

  @Patch(":id/retry")
  @ApiOperation({ summary: "Retry a failed email delivery" })
  @ApiOkResponse({ type: EmailDeliveryLogResponseDto })
  retryFailed(
    @Param("id") id: string,
    @CurrentUser() user: User,
  ): Promise<EmailDeliveryLogResponseDto> {
    return this.service.retryFailed(id, user);
  }

  @Patch("retry-due")
  @ApiOperation({ summary: "Retry due failed email deliveries" })
  @ApiOkResponse({ type: [EmailDeliveryLogResponseDto] })
  retryDueFailures(
    @CurrentUser() user: User,
  ): Promise<EmailDeliveryLogResponseDto[]> {
    return this.service.retryDueFailures(user);
  }
}
