import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import {
  NotificationActionResponseDto,
  NotificationResponseDto,
  UnreadNotificationCountResponseDto,
} from "./dto/notification-response.dto";
import { Notification } from "./notification.entity";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
  ) {}

  async findForUser(user: User): Promise<NotificationResponseDto[]> {
  async findForUser(user: User): Promise<Notification[]> {
    try {
      return NotificationResponseDto.collection(
        await this.notifications.find({
          where: { user: { id: user.id } },
          order: { createdAt: "DESC" },
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  async unreadCount(user: User): Promise<UnreadNotificationCountResponseDto> {
  async unreadCount(user: User): Promise<{ unread: number }> {
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
  ): Promise<Notification> {
    try {
      return NotificationResponseDto.fromEntity(
        await this.notifications.save(
          this.notifications.create({
            user,
            title,
            message,
            type,
            metadata,
          }),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async markRead(id: string, user: User): Promise<Notification> {
    try {
      const notification = await this.notifications.findOne({
        where: { id, user: { id: user.id } },
      });

      if (!notification) {
        throw new NotFoundException("Notification not found");
      }

      notification.isRead = true;
      return NotificationResponseDto.fromEntity(await this.notifications.save(notification));
    } catch (error) {
      throw error;
    }
  }

  async markAllRead(user: User): Promise<{ message: string }> {
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
