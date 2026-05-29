import {
  Body,
  Controller,
  Delete,
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
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { BoardroomsService } from "./boardrooms.service";
import { CreateBoardroomDto } from "./dto/create-boardroom.dto";

@ApiTags("Boardrooms")
@ApiBearerAuth()
@Controller("boardrooms")
@UseGuards(RolesGuard)
export class BoardroomsController {
  constructor(private readonly boardroomsService: BoardroomsService) {}

  @Get()
  @ApiOperation({ summary: "Get boardrooms" })
  @ApiOkResponse({
    description: "Returns active and administrative boardroom data.",
  })
  findAll() {
    return this.boardroomsService.findAll();
  }

  @Get("available")
  @ApiOperation({ summary: "Search available boardrooms" })
  @ApiQuery({ name: "startDateTime", example: "2026-06-03T09:00:00.000Z" })
  @ApiQuery({ name: "endDateTime", example: "2026-06-03T10:30:00.000Z" })
  @ApiQuery({ name: "capacity", required: false, example: 8 })
  @ApiQuery({ name: "location", required: false, example: "Sandton Office" })
  available(@Query() query: Record<string, string>) {
    return this.boardroomsService.available(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get boardroom by ID" })
  findOne(@Param("id") id: string) {
    return this.boardroomsService.findOne(id);
  }

  @Get(":id/availability")
  @ApiOperation({ summary: "Get daily availability for a boardroom" })
  @ApiQuery({ name: "date", example: "2026-06-03" })
  availability(@Param("id") id: string, @Query("date") date: string) {
    return this.boardroomsService.availability(id, date);
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Create boardroom" })
  @ApiBody({ type: CreateBoardroomDto })
  @ApiCreatedResponse({ description: "Boardroom created successfully." })
  create(@Body() dto: CreateBoardroomDto) {
    return this.boardroomsService.create(dto);
  }

  @Patch(":id")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Update boardroom" })
  @ApiBody({ type: CreateBoardroomDto })
  update(@Param("id") id: string, @Body() dto: Partial<CreateBoardroomDto>) {
    return this.boardroomsService.update(id, dto);
  }

  @Patch(":id/status")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Deactivate boardroom" })
  deactivate(@Param("id") id: string) {
    return this.boardroomsService.deactivate(id);
  }

  @Delete(":id")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({
    summary: "Remove/deactivate boardroom where business rules allow",
  })
  remove(@Param("id") id: string) {
    return this.boardroomsService.deactivate(id);
  }

  @Post(":id/amenities")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Assign amenities to boardroom" })
  @ApiBody({
    schema: {
      example: { amenityIds: ["a1b2c3d4-1111-2222-3333-444444444444"] },
    },
  })
  assignAmenities(
    @Param("id") id: string,
    @Body("amenityIds") amenityIds: string[],
  ) {
    return this.boardroomsService.assignAmenities(id, amenityIds);
  }
}
