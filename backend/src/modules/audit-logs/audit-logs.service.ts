import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { User } from "../users/user.entity";
import { AuditLog } from "./audit-log.entity";

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findAll(query: Record<string, string> = {}): Promise<any[]> {
    try {
      const qb = this.auditLogs
        .createQueryBuilder("audit")
        .orderBy("audit.createdAt", "DESC");

      if (query.actorUserId) {
        qb.andWhere("audit.actorUserId = :actorUserId", {
          actorUserId: query.actorUserId,
        });
      }

      if (query.entityName) {
        qb.andWhere("audit.entityName = :entityName", {
          entityName: query.entityName,
        });
      }

      if (query.entityId) {
        qb.andWhere("audit.entityId = :entityId", { entityId: query.entityId });
      }

      if (query.action) {
        qb.andWhere("audit.action ILIKE :action", {
          action: `%${query.action}%`,
        });
      }

      const logs = await qb.getMany();
      const actorIds = logs
        .map((log) => log.actorUserId)
        .filter((id): id is string => Boolean(id));
      const actors = actorIds.length
        ? await this.users.find({ where: { id: In(actorIds) } })
        : [];
      const actorMap = new Map(
        actors.map((actor) => [
          actor.id,
          `${actor.firstName} ${actor.lastName}`.trim() || actor.email,
        ]),
      );

      return logs.map((log) => ({
        createdAt: log.createdAt,
        action: log.action,
        entityName: log.entityName,
        actorName: log.actorUserId
          ? actorMap.get(log.actorUserId) || "Unknown user"
          : "System",
        entityLabel: this.entityLabel(log),
      }));
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const log = await this.auditLogs.findOne({ where: { id } });
      if (!log) return null;
      const actor = log.actorUserId
        ? await this.users.findOne({ where: { id: log.actorUserId } })
        : null;
      return {
        createdAt: log.createdAt,
        action: log.action,
        entityName: log.entityName,
        actorName: actor
          ? `${actor.firstName} ${actor.lastName}`.trim() || actor.email
          : "System",
        entityLabel: this.entityLabel(log),
        before: log.before,
        after: log.after,
      };
    } catch (error) {
      throw error;
    }
  }

  async record(params: {
    actor?: User | null;
    action: string;
    entityName: string;
    entityId?: string;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    try {
      return this.auditLogs.save(
        this.auditLogs.create({
          actorUserId: params.actor?.id,
          action: params.action,
          entityName: params.entityName,
          entityId: params.entityId,
          before: params.before || undefined,
          after: params.after || undefined,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  private entityLabel(log: AuditLog): string {
    const after = log.after || {};
    const before = log.before || {};
    const title =
      after["title"] ||
      before["title"] ||
      after["name"] ||
      before["name"] ||
      after["status"] ||
      before["status"];
    return title ? String(title) : log.entityName;
  }
}
