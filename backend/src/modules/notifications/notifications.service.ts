import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { Notification } from "./notification.entity";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
  ) {}

  async findForUser(user: User) {
    try {
      return this.notifications.find({
        where: { user: { id: user.id } },
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      throw error;
    }
  }

  async unreadCount(user: User) {
    try {
      return {
        unread: await this.notifications.count({
          where: { user: { id: user.id }, isRead: false },
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async createForUser(
    user: User,
    title: string,
    message: string,
    type = "INFO",
    metadata?: Record<string, unknown>,
  ) {
    try {
      return this.notifications.save(
        this.notifications.create({
          user,
          title,
          message,
          type,
          metadata,
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  async markRead(id: string, user: User) {
    try {
      const notification = await this.notifications.findOne({
        where: { id, user: { id: user.id } },
      });

      if (!notification) {
        throw new NotFoundException("Notification not found");
      }

      notification.isRead = true;
      return this.notifications.save(notification);
    } catch (error) {
      throw error;
    }
  }

  async markAllRead(user: User) {
    try {
      await this.notifications
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true })
        .where('"userId" = :userId', { userId: user.id })
        .andWhere('"isRead" = false')
        .execute();

      return { message: "All notifications marked as read" };
    } catch (error) {
      throw error;
    }
  }
}
