import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { AuditLog } from "./audit-log.entity";

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
  ) {}

  async findAll(query: Record<string, string> = {}) {
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

      return qb.getMany();
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
  }) {
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
}
