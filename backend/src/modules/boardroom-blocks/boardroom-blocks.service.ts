import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "../audit-logs/audit-log.entity";
import { Boardroom } from "../boardrooms/boardroom.entity";
import { Notification } from "../notifications/notification.entity";
import { User } from "../users/user.entity";
import { CreateBoardroomBlockDto } from "./dto/create-boardroom-block.dto";
import { BoardroomBlock } from "./boardroom-block.entity";

@Injectable()
export class BoardroomBlocksService {
  constructor(
    @InjectRepository(BoardroomBlock)
    private readonly blocks: Repository<BoardroomBlock>,
    @InjectRepository(Boardroom)
    private readonly rooms: Repository<Boardroom>,
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findAll(): Promise<BoardroomBlock[]> {
    try {
      return this.blocks.find({ order: { startDateTime: "DESC" } });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<BoardroomBlock> {
    try {
      const block = await this.blocks.findOne({ where: { id } });
      if (!block) throw new NotFoundException("Room block not found");
      return block;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, dto: Partial<CreateBoardroomBlockDto>, user?: User): Promise<BoardroomBlock> {
    try {
      const block = await this.findOne(id);
      const before = {
        id: block.id,
        reason: block.reason,
        startDateTime: block.startDateTime,
        endDateTime: block.endDateTime,
        isActive: block.isActive,
      };

      if (dto.reason !== undefined) block.reason = dto.reason;
      if (dto.startDateTime !== undefined)
        block.startDateTime = new Date(dto.startDateTime);
      if (dto.endDateTime !== undefined)
        block.endDateTime = new Date(dto.endDateTime);

      if (block.endDateTime <= block.startDateTime) {
        throw new BadRequestException(
          "End date-time must be after start date-time",
        );
      }

      const saved = await this.blocks.save(block);
      if (user) {
        await this.audit(
          user,
          "ROOM_BLOCK_UPDATED",
          "BoardroomBlock",
          saved.id,
          before,
          {
            id: saved.id,
            reason: saved.reason,
            startDateTime: saved.startDateTime,
            endDateTime: saved.endDateTime,
            isActive: saved.isActive,
          },
        );
      }
      return saved;
    } catch (error) {
      throw error;
    }
  }

  async create(dto: CreateBoardroomBlockDto, user: User): Promise<BoardroomBlock> {
    try {
      const room = await this.rooms.findOne({ where: { id: dto.boardroomId } });
      if (!room) throw new NotFoundException("Boardroom not found");

      const start = new Date(dto.startDateTime);
      const end = new Date(dto.endDateTime);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new BadRequestException("Start and end date-times are required");
      }
      if (end <= start)
        throw new BadRequestException(
          "End date-time must be after start date-time",
        );

      const block = await this.blocks.save(
        this.blocks.create({
          boardroom: room,
          reason: dto.reason,
          startDateTime: start,
          endDateTime: end,
          createdByUser: user,
          isActive: true,
        }),
      );

      await this.notifyAdmins(
        "Room blocked",
        `${room.name} was blocked for ${dto.reason}.`,
        "ROOM_BLOCKED",
        { blockId: block.id },
      );
      await this.audit(
        user,
        "ROOM_BLOCK_CREATED",
        "BoardroomBlock",
        block.id,
        null,
        {
          boardroomId: room.id,
          reason: block.reason,
          startDateTime: block.startDateTime,
          endDateTime: block.endDateTime,
        },
      );

      return block;
    } catch (error) {
      throw error;
    }
  }

  async deactivate(id: string, user: User): Promise<BoardroomBlock> {
    try {
      const block = await this.blocks.findOne({ where: { id } });
      if (!block) throw new NotFoundException("Room block not found");

      const before = { id: block.id, isActive: block.isActive };
      block.isActive = false;
      const saved = await this.blocks.save(block);

      await this.audit(
        user,
        "ROOM_BLOCK_DEACTIVATED",
        "BoardroomBlock",
        saved.id,
        before,
        { id: saved.id, isActive: saved.isActive },
      );
      return saved;
    } catch (error) {
      throw error;
    }
  }

  private async notifyAdmins(
    title: string,
    message: string,
    type: string,
    metadata?: Record<string, unknown>,
  ) {
    const users = await this.users
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("role.name IN (:...roles)", {
        roles: ["ADMIN", "SUPER_ADMIN", "FACILITIES_MANAGER"],
      })
      .getMany();

    for (const user of users) {
      await this.notifications.save(
        this.notifications.create({ user, title, message, type, metadata }),
      );
    }
  }

  private async audit(
    actor: User,
    action: string,
    entityName: string,
    entityId?: string,
    before?: Record<string, unknown> | null,
    after?: Record<string, unknown> | null,
  ) {
    await this.auditLogs.save(
      this.auditLogs.create({
        actorUserId: actor?.id,
        action,
        entityName,
        entityId,
        before: before || undefined,
        after: after || undefined,
      }),
    );
  }
}
