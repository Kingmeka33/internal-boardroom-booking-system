import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty } from "class-validator";

export class CreateBoardroomBlockDto {
  @ApiProperty({
    example: "e3b0c442-98fc-4f6a-8d2a-222222222222",
    description: "Boardroom ID to block. Use GET /boardrooms to retrieve IDs.",
  })
  @IsNotEmpty()
  boardroomId: string;

  @ApiProperty({
    example: "Projector maintenance",
    description: "Reason for blocking the boardroom.",
  })
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: "2026-06-04T13:00:00.000Z",
    description: "Block start date-time in ISO format.",
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    example: "2026-06-04T15:00:00.000Z",
    description: "Block end date-time in ISO format.",
  })
  @IsDateString()
  endDateTime: string;
}
