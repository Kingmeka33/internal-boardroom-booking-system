import { ApiProperty } from "@nestjs/swagger";
import { BoardroomBlock } from "../boardroom-block.entity";

export class BoardroomBlockRoomResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() location: string;
}

export class BoardroomBlockUserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email: string;
}

export class BoardroomBlockResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ type: BoardroomBlockRoomResponseDto })
  boardroom: BoardroomBlockRoomResponseDto;
  @ApiProperty() reason: string;
  @ApiProperty() startDateTime: Date;
  @ApiProperty() endDateTime: Date;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ type: BoardroomBlockUserResponseDto })
  createdByUser: BoardroomBlockUserResponseDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  static fromEntity(block: BoardroomBlock): BoardroomBlockResponseDto {
    return {
      id: block.id,
      boardroom: block.boardroom
        ? {
            id: block.boardroom.id,
            name: block.boardroom.name,
            location: block.boardroom.location,
          }
        : null,
      reason: block.reason,
      startDateTime: block.startDateTime,
      endDateTime: block.endDateTime,
      isActive: block.isActive,
      createdByUser: block.createdByUser
        ? {
            id: block.createdByUser.id,
            firstName: block.createdByUser.firstName,
            lastName: block.createdByUser.lastName,
            email: block.createdByUser.email,
          }
        : null,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    };
  }

  static collection(blocks: BoardroomBlock[]): BoardroomBlockResponseDto[] {
    return blocks.map((block) => BoardroomBlockResponseDto.fromEntity(block));
  }
}
