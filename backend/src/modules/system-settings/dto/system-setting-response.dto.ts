import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SystemSettingResponseDto {
  @ApiProperty({ example: "ALLOW_AFTER_HOURS_BOOKINGS" })
  key: string;

  @ApiProperty({
    example: "yes",
    description: "yes/no for boolean settings or a number for numeric settings.",
  })
  value: string;

  @ApiPropertyOptional({ example: "Controls booking outside room operating hours." })
  description?: string;
}