import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "employee@company.com",
    description:
      "Email address that should receive the password reset instructions.",
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: "reset-token-from-email",
    description: "Password reset token issued by the forgot password workflow.",
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: "NewPassword123!",
    description: "New password to save for the user.",
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
