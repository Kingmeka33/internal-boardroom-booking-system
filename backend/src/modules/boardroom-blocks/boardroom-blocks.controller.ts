import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { User } from "../users/user.entity";
import { BoardroomBlocksService } from "./boardroom-blocks.service";
import { CreateBoardroomBlockDto } from "./dto/create-boardroom-block.dto";

@ApiTags("Boardroom Blocks")
@ApiBearerAuth()
@Controller("boardroom-blocks")
@UseGuards(RolesGuard)
export class BoardroomBlocksController {
  constructor(private readonly service: BoardroomBlocksService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get all room blocks" })
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Get room block by ID" })
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Create room block" })
  @ApiBody({ type: CreateBoardroomBlockDto })
  create(@Body() dto: CreateBoardroomBlockDto, @CurrentUser() user: User) {
    return this.service.create(dto, user);
  }

  @Patch(":id")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Update room block" })
  @ApiBody({ type: CreateBoardroomBlockDto })
  update(
    @Param("id") id: string,
    @Body() dto: Partial<CreateBoardroomBlockDto>,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(":id")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.FACILITIES_MANAGER)
  @ApiOperation({ summary: "Deactivate room block" })
  deactivate(@Param("id") id: string, @CurrentUser() user: User) {
    return this.service.deactivate(id, user);
  }
}
