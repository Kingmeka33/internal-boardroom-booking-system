import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreateBoardroomDto {
  @ApiProperty({ example: "Executive Boardroom", description: "Display name of the boardroom." })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "BR-EXEC-01", description: "Unique boardroom code." })
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: "Large executive meeting room with video conferencing." })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "Sandton Office", description: "Physical location or office site." })
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: "5th Floor" })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional({ example: "Main Building" })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiProperty({ example: 12, description: "Maximum number of attendees allowed in this room.", minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ example: "https://example.com/images/executive-boardroom.jpg" })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true, description: "Whether the room is active." })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true, description: "Whether employees can book this room." })
  @IsOptional()
  @IsBoolean()
  isBookable?: boolean;

  @ApiPropertyOptional({ example: true, description: "If true, bookings for this room start as pending approval." })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ example: "08:00", description: "Room opening time." })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({ example: "17:00", description: "Room closing time." })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiPropertyOptional({ example: 15, description: "Minimum booking duration in minutes." })
  @IsOptional()
  @IsInt()
  @Min(1)
  minimumBookingMinutes?: number;

  @ApiPropertyOptional({ example: 240, description: "Maximum booking duration in minutes." })
  @IsOptional()
  @IsInt()
  @Min(1)
  maximumBookingMinutes?: number;

  @ApiPropertyOptional({ example: 0, description: "Buffer before bookings in minutes." })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTimeBeforeMinutes?: number;

  @ApiPropertyOptional({ example: 0, description: "Buffer after bookings in minutes." })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTimeAfterMinutes?: number;
}
