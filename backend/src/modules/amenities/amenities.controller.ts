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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleName } from "../../shared/enums/role-name.enum";
import { RolesGuard } from "../../shared/guards/roles.guard";
import { AmenitiesService } from "./amenities.service";
import { CreateAmenityDto } from "./dto/create-amenity.dto";

@ApiTags("Amenities")
@ApiBearerAuth()
@Controller("amenities")
@UseGuards(RolesGuard)
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  @ApiOperation({ summary: "Get all amenities" })
  findAll() {
    return this.amenitiesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get amenity by ID" })
  findOne(@Param("id") id: string) {
    return this.amenitiesService.findOne(id);
  }

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Create amenity" })
  @ApiBody({ type: CreateAmenityDto })
  @ApiCreatedResponse({ description: "Amenity created successfully." })
  create(@Body() dto: CreateAmenityDto) {
    return this.amenitiesService.create(dto);
  }

  @Patch(":id")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Update amenity" })
  @ApiBody({ type: CreateAmenityDto })
  update(@Param("id") id: string, @Body() dto: Partial<CreateAmenityDto>) {
    return this.amenitiesService.update(id, dto);
  }

  @Delete(":id")
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: "Deactivate amenity" })
  deactivate(@Param("id") id: string) {
    return this.amenitiesService.deactivate(id);
  }
}
