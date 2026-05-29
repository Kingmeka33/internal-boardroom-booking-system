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
          <div class="eyebrow">My schedule</div>
          <h1>My Bookings</h1>
          <p class="muted">View your upcoming, pending, past and cancelled reservations.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="tab-row">
        <button class="tab" [class.active]="activeTab === 'upcoming'" (click)="activeTab = 'upcoming'">Upcoming</button>
        <button class="tab" [class.active]="activeTab === 'pending'" (click)="activeTab = 'pending'">Pending</button>
        <button class="tab" [class.active]="activeTab === 'past'" (click)="activeTab = 'past'">Past</button>
        <button class="tab" [class.active]="activeTab === 'cancelled'" (click)="activeTab = 'cancelled'">Cancelled</button>
      </div>

      <div class="booking-list">
        <article *ngFor="let booking of filteredBookings()" class="booking-card">
          <div class="booking-time">{{ booking.startDateTime | date: 'EEE, d MMM HH:mm' }} - {{ booking.endDateTime | date: 'HH:mm' }}</div>
          <h3>{{ booking.title }}</h3>
          <p>{{ booking.boardroom?.name }} · {{ booking.boardroom?.location }}</p>
          <span class="badge" [ngClass]="statusClass(booking.status)">{{ booking.status }}</span>
          <div class="actions" *ngIf="canCancel(booking)">
            <button class="btn tiny danger" type="button" (click)="cancel(booking.id)">Cancel request</button>
          </div>
        </article>
      </div>

      <div *ngIf="filteredBookings().length === 0" class="card empty-state">
        <strong>No bookings in this tab</strong>
        <p>Use Create Booking to reserve a boardroom.</p>
      </div>
    </section>
  `,
})
export class MyBookingsComponent {
  bookings: any[] = [];
  activeTab: "upcoming" | "pending" | "past" | "cancelled" = "upcoming";

  constructor(private readonly api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.myBookings().subscribe({ next: (res: any) => (this.bookings = Array.isArray(res) ? res : []), error: () => (this.bookings = []) });
  }

  filteredBookings() {
    const now = new Date();
    return this.bookings.filter((booking) => {
      const start = new Date(booking.startDateTime);
      if (this.activeTab === "pending") return booking.status === "PENDING_APPROVAL";
      if (this.activeTab === "cancelled") return booking.status === "CANCELLED" || booking.status === "REJECTED";
      if (this.activeTab === "past") return start < now || booking.status === "COMPLETED" || booking.status === "NO_SHOW";
      return start >= now && ["APPROVED", "PENDING_APPROVAL"].includes(booking.status);
    });
  }

  canCancel(booking: any) { return ["APPROVED", "PENDING_APPROVAL"].includes(booking.status); }
  statusClass(status: string) { return status?.toLowerCase()?.replace("_", "-") || ""; }

  cancel(id: string) {
    const reason = prompt("Cancellation reason") || "Cancelled by employee";
    this.api.cancelBooking(id, reason).subscribe({ next: () => this.load() });
  }
}
