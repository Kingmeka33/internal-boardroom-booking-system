import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Amenity } from "../amenity.entity";

export class AmenityResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() icon?: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(amenity: Amenity): AmenityResponseDto {
    return {
      id: amenity.id,
      name: amenity.name,
      description: amenity.description,
      icon: amenity.icon,
      isActive: amenity.isActive,
      createdAt: amenity.createdAt,
      updatedAt: amenity.updatedAt,
    };
  }

  static collection(amenities: Amenity[]): AmenityResponseDto[] {
    return amenities.map((amenity) => AmenityResponseDto.fromEntity(amenity));
  }
}
