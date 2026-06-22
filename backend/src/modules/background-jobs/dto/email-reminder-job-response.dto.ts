import { ApiProperty } from "@nestjs/swagger";

export class EmailReminderJobResponseDto {
  @ApiProperty({ example: 15 })
  windowMinutes: number;

  @ApiProperty({ example: 3 })
  sent: number;

  @ApiProperty({ example: 4 })
  queued: number;

  @ApiProperty({ example: 0 })
  failed: number;

  @ApiProperty({ example: 2 })
  skipped: number;

  @ApiProperty({ example: 1 })
  retries: number;
}
