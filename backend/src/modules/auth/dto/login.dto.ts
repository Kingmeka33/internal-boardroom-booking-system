import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "admin@company.com",
    description: "Registered user email address.",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "Password123!",
    description: "User password.",
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
