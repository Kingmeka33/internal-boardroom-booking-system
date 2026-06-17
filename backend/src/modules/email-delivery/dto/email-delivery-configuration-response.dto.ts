import { ApiProperty } from "@nestjs/swagger";

export class EmailDeliveryConfigurationResponseDto {
  @ApiProperty() enabled: boolean;
  @ApiProperty() mode: string;
  @ApiProperty() fromAddress: string;
  @ApiProperty() fromAddressLooksValid: boolean;
  @ApiProperty() apiKeyConfigured: boolean;
  @ApiProperty() secretKeyConfigured: boolean;
  @ApiProperty() deliveryReady: boolean;
  @ApiProperty({ type: [String] }) issues: string[];
}
