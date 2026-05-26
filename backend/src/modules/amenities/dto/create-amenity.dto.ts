import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAmenityDto {
  @ApiProperty({ example: "Video Conferencing", description: "Amenity name." })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: "Room supports Teams, Zoom and Google Meet.",
    description: "Optional amenity description.",
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: "video-camera",
    description: "Optional icon key for frontend display.",
  })
  @IsOptional()
  icon?: string;
}
