import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { RoleName } from "../../shared/enums/role-name.enum";
import { Role } from "../roles/role.entity";
import { User } from "../users/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.users.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email is already registered");
      }

      const requestedRoleName = dto.roleName || RoleName.EMPLOYEE;

      const selectedRole = await this.roles.findOne({
        where: { name: requestedRoleName },
      });

      if (!selectedRole) {
        throw new ConflictException(
          `${requestedRoleName} role has not been seeded yet`,
        );
      }

      const user = this.users.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        phoneNumber: dto.phoneNumber,
        department: dto.department,
        jobTitle: dto.jobTitle,
        role: selectedRole,
        isActive: true,
      });

      const savedUser = await this.users.save(user);
      return this.issueTokens(savedUser);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.users.findOne({
        where: { email: dto.email },
        relations: ["role"],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException("Invalid email or password");
      }

      const passwordMatches = await bcrypt.compare(dto.password, user.password);

      if (!passwordMatches) {
        throw new UnauthorizedException("Invalid email or password");
      }

      return this.issueTokens(user);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      throw error;
    }
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwt.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.users.findOne({
        where: { id: payload.sub },
        relations: ["role"],
      });

      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const tokenMatches = await bcrypt.compare(
        dto.refreshToken,
        user.refreshTokenHash,
      );

      if (!tokenMatches) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      return this.issueTokens(user);
    } catch (error) {
      console.error("REFRESH ERROR:", error);
      throw error;
    }
  }

  async logout(user: User) {
    try {
      user.refreshTokenHash = null;
      await this.users.save(user);
      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      throw error;
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      return {
        email: dto.email,
        message: "Password reset instructions sent if email exists",
      };
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      throw error;
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      return {
        token: dto.token,
        message: "Password reset successful",
      };
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      throw error;
    }
  }

  private async issueTokens(user: User) {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role?.name,
      };

      console.log("JWT_ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET);
      console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);
      console.log("User role:", user.role);

      const accessToken = await this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      });

      const refreshToken = await this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      });

      user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await this.users.save(user);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role?.name,
        },
      };
    } catch (error) {
      console.error("ISSUE TOKENS ERROR:", error);
      throw error;
    }
  }
}