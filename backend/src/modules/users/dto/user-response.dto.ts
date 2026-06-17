import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { User } from "../user.entity";

export class UserRoleResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
  @ApiPropertyOptional() phoneNumber?: string;
  @ApiPropertyOptional() department?: string;
  @ApiPropertyOptional() jobTitle?: string;
  @ApiProperty({ type: UserRoleResponseDto })
  role: UserRoleResponseDto;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      department: user.department,
      jobTitle: user.jobTitle,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static collection(users: User[]): UserResponseDto[] {
    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}
