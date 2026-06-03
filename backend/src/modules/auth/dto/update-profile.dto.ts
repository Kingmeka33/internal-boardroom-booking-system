import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "+27110000000" })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;
}
