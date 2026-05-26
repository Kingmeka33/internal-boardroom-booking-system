import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { RoleName } from "../../../shared/enums/role-name.enum";

export class RegisterDto {
  @ApiProperty({ example: "Jane" })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Mokoena" })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: "jane@company.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Employee123!" })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    enum: RoleName,
    example: RoleName.EMPLOYEE,
    description: "Role selected during registration. Defaults to EMPLOYEE if not supplied.",
  })
  @IsOptional()
  @IsEnum(RoleName)
  roleName?: RoleName;

  @ApiPropertyOptional({ example: "+27110000000" })
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: "Operations" })
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: "Operations Coordinator" })
  @IsOptional()
  jobTitle?: string;
}
