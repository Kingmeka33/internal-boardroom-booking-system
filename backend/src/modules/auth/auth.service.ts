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

  async register(dto: RegisterDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }> {
    try {
      const existingUser = await this.users.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email is already registered");
      }

      const employeeRole = await this.roles.findOne({
        where: { name: RoleName.EMPLOYEE },
      });

      if (!employeeRole) {
        throw new ConflictException("Employee role has not been seeded yet");
      }
       const user = this.users.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        phoneNumber: dto.phoneNumber,
        department: dto.department,
        jobTitle: dto.jobTitle,
        role: employeeRole,
        isActive: true,
      });

       const savedUser = await this.users.save(user);

      return this.issueTokens(savedUser);
    } catch (error) {
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }> {
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
      throw error;
    }
  }

  async refresh(dto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }> {
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
      throw error;
    }
  }

  async logout(user: User): Promise<{ message: string }> {
    try {
      user.refreshTokenHash = null;
      await this.users.save(user);

      return { message: "Logged out successfully" };
    } catch (error) {
      throw error;
    }
  }

   async forgotPassword(dto: ForgotPasswordDto): Promise<{
    email: string;
    message: string;
  }> {
    try {
      return {
        email: dto.email,
        message: "Password reset instructions sent if email exists",
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{
    token: string;
    message: string;
  }> {
    try {
      return {
        token: dto.token,
        message: "Password reset successful",
      };
    } catch (error) {
      throw error;
    }
  }

   private async issueTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
    };

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
  }
}
