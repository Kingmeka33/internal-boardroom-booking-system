import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from "class-validator";

export class CreateBookingDto {
  @ApiProperty({
    example: "e3b0c442-98fc-4f6a-8d2a-222222222222",
    description:
      "Boardroom ID selected for the booking. Use GET /boardrooms to retrieve IDs.",
  })
  @IsNotEmpty()
  boardroomId: string;

  @ApiProperty({
    example: "Quarterly Planning Meeting",
    description: "Booking title.",
  })
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: "Planning session for the next quarter.",
    description: "Optional booking description.",
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: "2026-06-03T09:00:00.000Z",
    description: "Booking start date-time in ISO format.",
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    example: "2026-06-03T10:30:00.000Z",
    description:
      "Booking end date-time in ISO format. Must be after startDateTime.",
  })
  @IsDateString()
  endDateTime: string;

  @ApiProperty({
    example: 8,
    description: "Number of meeting attendees.",
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  attendeeCount: number;

  @ApiPropertyOptional({
    example: "Internal",
    description: "Meeting type such as Internal, External or Executive.",
  })
  @IsOptional()
  meetingType?: string;

  @ApiPropertyOptional({
    example: false,
    description: "Whether catering is required.",
  })
  @IsOptional()
  @IsBoolean()
  requiresCatering?: boolean;

  @ApiPropertyOptional({
    example: "Tea, coffee and water for 8 people.",
    description: "Catering notes if catering is required.",
  })
  @IsOptional()
  cateringNotes?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether facilities setup is required.",
  })
  @IsOptional()
  @IsBoolean()
  requiresSetup?: boolean;

  @ApiPropertyOptional({
    example: "Arrange room in boardroom layout and test projector.",
    description: "Setup notes for facilities team.",
  })
  @IsOptional()
  setupNotes?: string;
}
