import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../../shared/decorators/current-user.decorator";
import { Public } from "../../shared/decorators/public.decorator";
import { User } from "../users/user.entity";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/reset-password.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Create a new employee account" })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description:
      "Registration successful. Returns access token, refresh token and user profile.",
    schema: {
      example: {
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-example",
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-example",
        user: {
          id: "8c31d3c7-9d4e-41db-91d5-222222222222",
          firstName: "Jane",
          lastName: "Mokoena",
          email: "jane@company.com",
          role: "EMPLOYEE",
        },
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login using email and password" })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      "Login successful. Returns access token, refresh token and user profile.",
    schema: {
      example: {
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-example",
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-example",
        user: {
          id: "8c31d3c7-9d4e-41db-91d5-111111111111",
          firstName: "System",
          lastName: "Admin",
          email: "admin@company.com",
          role: "SUPER_ADMIN",
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Invalid email or password." })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post("refresh-token")
  @ApiOperation({ summary: "Refresh access token using a valid refresh token" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: "New access token and refresh token returned.",
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto);
  }

  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Logout the current user and invalidate stored refresh token",
  })
  @ApiOkResponse({
    schema: { example: { message: "Logged out successfully" } },
  })
  logout(@CurrentUser() user: User) {
    return this.auth.logout(user);
  }

  @Public()
  @Post("forgot-password")
  @ApiOperation({ summary: "Start password reset workflow" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    schema: {
      example: { message: "Password reset instructions sent if email exists" },
    },
  })
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  @ApiOperation({ summary: "Complete password reset workflow" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    schema: { example: { message: "Password reset successful" } },
  })
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }
}
