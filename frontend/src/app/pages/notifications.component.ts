import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../services/api.service";
import { ToastService } from "../services/toast.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
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

      <div class="card filters">
        <div class="field">
          <label>Notification type</label>
          <select [(ngModel)]="typeFilter">
            <option value="">All notifications</option>
            <option value="FACILITIES_REQUEST">Catering and setup requests</option>
            <option value="BOOKING_CREATED">Booking created</option>
            <option value="BOOKING_APPROVED">Booking approved</option>
            <option value="BOOKING_CANCELLED">Booking cancelled</option>
          </select>
        </div>
      </div>

      <div class="notification-list">
        <article *ngFor="let notification of filteredNotifications()" class="card notification-card" [class.unread]="!notification.isRead">
          <div>
            <strong>{{ notification.title }}</strong>
            <span class="mini-chip">{{ notification.type }}</span>
            <p>{{ notification.message }}</p>
            <span class="muted small">{{ notification.createdAt | date: 'd MMM yyyy HH:mm' }}</span>
          </div>
          <button *ngIf="!notification.isRead" class="btn tiny secondary" type="button" (click)="markRead(notification.id)">Mark read</button>
        </article>
      </div>

      <div *ngIf="filteredNotifications().length === 0" class="card empty-state">
        <strong>No notifications yet</strong>
        <p>Booking updates will appear here.</p>
      </div>
    </section>
  `,
})
export class NotificationsComponent {
  notifications: any[] = [];
  typeFilter = "";

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit() { this.load(); }
  load() {
    this.api.notifications().subscribe({
      next: (res: any) => (this.notifications = Array.isArray(res) ? res : []),
      error: (err) => {
        this.notifications = [];
        this.toast.error(this.errorMessage(err, "Could not load notifications."));
      },
    });
  }
  markRead(id: string) {
    this.api.markNotificationRead(id).subscribe({
      next: () => {
        this.toast.success("Notification marked as read.");
        this.load();
      },
      error: (err) => this.toast.error(this.errorMessage(err, "Could not update notification.")),
    });
  }
  markAllRead() {
    this.api.markAllNotificationsRead().subscribe({
      next: () => {
        this.toast.success("All notifications marked as read.");
        this.load();
      },
      error: (err) => this.toast.error(this.errorMessage(err, "Could not update notifications.")),
    });
  }

  filteredNotifications() {
    if (!this.typeFilter) return this.notifications;
    return this.notifications.filter((notification) => notification.type === this.typeFilter);
  }

  private errorMessage(err: any, fallback: string): string {
    const message = err?.error?.message || fallback;
    return Array.isArray(message) ? message.join(", ") : message;
  }
}
