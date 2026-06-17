import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { EmailDeliveryLog } from "../email-delivery-log.entity";

export class EmailDeliveryLogResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() recipient: string;
  @ApiPropertyOptional() recipientName?: string;
  @ApiProperty() subject: string;
  @ApiProperty() type: string;
  @ApiProperty() status: string;
  @ApiProperty() attempts: number;
  @ApiPropertyOptional() lastError?: string;
  @ApiPropertyOptional({ type: Object }) metadata?: Record<string, unknown>;
  @ApiPropertyOptional() nextAttemptAt?: Date;
  @ApiPropertyOptional() sentAt?: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(log: EmailDeliveryLog): EmailDeliveryLogResponseDto {
    return {
      id: log.id,
      recipient: log.recipient,
      recipientName: log.recipientName,
      subject: log.subject,
      type: log.type,
      status: log.status,
      attempts: log.attempts,
      lastError: log.lastError,
      metadata: log.metadata,
      nextAttemptAt: log.nextAttemptAt,
      sentAt: log.sentAt,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }

  static collection(logs: EmailDeliveryLog[]): EmailDeliveryLogResponseDto[] {
    return logs.map((log) => this.fromEntity(log));
  }
}
