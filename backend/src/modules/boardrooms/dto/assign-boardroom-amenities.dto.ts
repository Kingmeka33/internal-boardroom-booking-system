import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class AssignBoardroomAmenitiesDto {
  @ApiProperty({
    example: ["a1b2c3d4-1111-2222-3333-444444444444"],
    description: "Amenity IDs to assign to this boardroom.",
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  amenityIds: string[];
}
