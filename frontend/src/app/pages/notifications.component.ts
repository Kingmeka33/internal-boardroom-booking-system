import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ApiService } from "../services/api.service";

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <div class="eyebrow">Inbox</div>
          <h1>Notifications</h1>
          <p class="muted">Booking confirmations, approvals, rejections, cancellations and room notices.</p>
        </div>
        <button class="btn secondary" type="button" (click)="markAllRead()">Mark all read</button>
      </div>

      <div class="notification-list">
        <article *ngFor="let notification of notifications" class="card notification-card" [class.unread]="!notification.isRead">
          <div>
            <strong>{{ notification.title }}</strong>
            <p>{{ notification.message }}</p>
            <span class="muted small">{{ notification.createdAt | date: 'd MMM yyyy HH:mm' }}</span>
          </div>
          <button *ngIf="!notification.isRead" class="btn tiny secondary" type="button" (click)="markRead(notification.id)">Mark read</button>
        </article>
      </div>

      <div *ngIf="notifications.length === 0" class="card empty-state">
        <strong>No notifications yet</strong>
        <p>Booking updates will appear here.</p>
      </div>
    </section>
  `,
})
export class NotificationsComponent {
  notifications: any[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit() { this.load(); }
  load() { this.api.notifications().subscribe({ next: (res: any) => (this.notifications = Array.isArray(res) ? res : []), error: () => (this.notifications = []) }); }
  markRead(id: string) { this.api.markNotificationRead(id).subscribe({ next: () => this.load() }); }
  markAllRead() { this.api.markAllNotificationsRead().subscribe({ next: () => this.load() }); }
}
