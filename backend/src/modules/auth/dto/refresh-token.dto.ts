import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-example",
    description: "Refresh token returned from the login endpoint.",
  })
  @IsNotEmpty()
  refreshToken: string;
}
