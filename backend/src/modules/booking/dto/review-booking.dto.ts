import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class RejectBookingDto {
  @ApiProperty({
    example: "Room is reserved for an executive session during this time.",
    description: "Reason why the booking is rejected.",
  })
  @IsNotEmpty()
  reason: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional({
    example: "Meeting cancelled by organiser.",
    description: "Optional cancellation reason.",
  })
  @IsOptional()
  reason?: string;
}
