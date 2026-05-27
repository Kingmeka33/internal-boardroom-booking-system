import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "Lerato", description: "User first name." })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Mokoena", description: "User last name." })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: "lerato.mokoena@company.com",
    description: "Unique user email.",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Password123!",
    description: "Temporary or initial password.",
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: "+27111234567",
    description: "Optional phone number.",
  })
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: "Human Resources",
    description: "User department.",
  })
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    example: "HR Officer",
    description: "User job title.",
  })
  @IsOptional()
  jobTitle?: string;

  @ApiProperty({
    example: "b2ef1d7c-f9c0-4f6a-9f0c-111111111111",
    description:
      "Role ID assigned to the user. Use GET /roles to find available role IDs.",
  })
  @IsNotEmpty()
  roleId: string;
}
