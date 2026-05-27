import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { User } from "../users/user.entity";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { CancelBookingDto, RejectBookingDto } from "./dto/review-booking.dto";

@ApiTags("Bookings")
@ApiBearerAuth()
@Controller("bookings")
@UseGuards(RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get all bookings with optional filters" })
  @ApiQuery({ name: "status", required: false, example: "APPROVED" })
  @ApiQuery({
    name: "boardroomId",
    required: false,
    example: "e3b0c442-98fc-4f6a-8d2a-222222222222",
  })
  findAll(@Query() query: Record<string, string>) {
    return this.bookingsService.findAll(query);
  }

  @Get("my-bookings")
  @ApiOperation({ summary: "Get bookings for the signed-in user" })
  myBookings(@CurrentUser() user: User) {
    return this.bookingsService.myBookings(user);
  }

  @Get("calendar")
  @ApiOperation({ summary: "Get booking events for calendar view" })
  @ApiQuery({
    name: "startDateTime",
    required: false,
    example: "2026-06-01T00:00:00.000Z",
  })
  @ApiQuery({
    name: "endDateTime",
    required: false,
    example: "2026-06-30T23:59:59.000Z",
  })
  calendar(@Query() query: Record<string, string>) {
    return this.bookingsService.calendar(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get booking by ID" })
  findOne(@Param("id") id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create booking" })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({
    description:
      "Booking created. Status is APPROVED or PENDING_APPROVAL depending on room rules.",
  })
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.create(dto, user);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update booking" })
  @ApiBody({ type: CreateBookingDto })
  update(
    @Param("id") id: string,
    @Body() dto: Partial<CreateBookingDto>,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.update(id, dto, user);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel booking" })
  @ApiBody({ type: CancelBookingDto })
  cancel(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(id, user, dto?.reason);
  }

  @Patch(":id/approve")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Approve pending booking" })
  approve(@Param("id") id: string, @CurrentUser() user: User) {
    return this.bookingsService.approve(id, user);
  }

  @Patch(":id/reject")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Reject pending booking" })
  @ApiBody({ type: RejectBookingDto })
  reject(
    @Param("id") id: string,
    @Body() dto: RejectBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.reject(id, user, dto.reason);
  }

  @Patch(":id/complete")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Mark booking as completed" })
  complete(@Param("id") id: string, @CurrentUser() user: User) {
    return this.bookingsService.complete(id, user);
  }

  @Patch(":id/no-show")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Mark booking as no-show" })
  noShow(@Param("id") id: string, @CurrentUser() user: User) {
    return this.bookingsService.noShow(id, user);
  }
}
