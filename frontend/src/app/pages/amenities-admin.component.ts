import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../services/api.service";
import { ToastService } from "../services/toast.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page admin-console">
      <div class="page-header app-page-header">
        <div>
          <div class="eyebrow">Governance</div>
          <h1>All Bookings</h1>
          <p class="muted">Review, approve, reject, cancel, complete and mark no-show bookings.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="card filters">
        <div class="field">
          <label>Room</label>
          <select [(ngModel)]="filters.boardroomId">
            <option value="">All rooms</option>
            <option *ngFor="let room of rooms" [value]="room.id">{{ room.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>Status</label>
          <select [(ngModel)]="filters.status">
            <option value="">All statuses</option>
            <option value="PENDING_APPROVAL">Pending approval</option>
            <option value="APPROVED">Approved</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No show</option>
          </select>
        </div>
        <div class="field"><label>Department</label><input [(ngModel)]="filters.department" placeholder="Operations" /></div>
        <div class="field"><label>Start date</label><input type="date" [(ngModel)]="filters.startDate" /></div>
        <div class="field"><label>End date</label><input type="date" [(ngModel)]="filters.endDate" /></div>
        <div class="field action-field"><label>&nbsp;</label><button class="btn" type="button" (click)="load()">Apply</button></div>
      </div>

      <section class="card admin-table-card">
        <div class="section-toolbar">
          <div>
            <h2>Booking governance</h2>
            <span class="muted small">{{ bookings.length }} booking records</span>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Meeting</th><th>Room</th><th>Booked by</th><th>When</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let booking of bookings">
                <td><strong>{{ booking.title }}</strong><br /><span class="muted small">{{ booking.meetingType || 'Internal' }}</span></td>
                <td>{{ booking.boardroom?.name || '-' }}</td>
                <td>{{ booking.bookedByUser?.firstName }} {{ booking.bookedByUser?.lastName }}</td>
                <td>{{ booking.startDateTime | date: 'd MMM HH:mm' }} - {{ booking.endDateTime | date: 'HH:mm' }}</td>
                <td><span class="badge" [ngClass]="statusClass(booking.status)">{{ booking.status }}</span></td>
                <td>
                  <div class="actions">
                    <button class="btn tiny" type="button" (click)="approve(booking.id)">Approve</button>
                    <button class="btn tiny secondary" type="button" (click)="reject(booking.id)">Reject</button>
                    <button class="btn tiny secondary" type="button" (click)="complete(booking.id)">Complete</button>
                    <button class="btn tiny secondary" type="button" (click)="noShow(booking.id)">No-show</button>
                    <button class="btn tiny danger" type="button" (click)="cancel(booking.id)">Cancel</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="bookings.length === 0" class="empty-inline">No bookings found.</div>
      </section>
    </section>
  `,
})
export class AdminBookingsComponent {
  bookings: any[] = [];
  rooms: any[] = [];
  filters = { status: "", boardroomId: "", department: "", startDate: "", endDate: "" };

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadRooms();
    this.load();
  }

  loadRooms() {
    this.api.boardrooms().subscribe({
      next: (res: any) => (this.rooms = Array.isArray(res) ? res : []),
      error: () => (this.rooms = []),
    });
  }

  load() {
    this.api.allBookings({
      status: this.filters.status,
      boardroomId: this.filters.boardroomId,
      department: this.filters.department,
      startDateTime: this.filters.startDate ? `${this.filters.startDate}T00:00:00.000Z` : "",
      endDateTime: this.filters.endDate ? `${this.filters.endDate}T23:59:59.000Z` : "",
    }).subscribe({
      next: (res: any) => (this.bookings = Array.isArray(res) ? res : []),
      error: (err) => {
        this.bookings = [];
        this.toast.error(this.errorMessage(err, "Could not load bookings."));
      },
    });
  }

  approve(id: string) { this.runAction(this.api.approveBooking(id), "Booking approved."); }
  complete(id: string) { this.runAction(this.api.completeBooking(id), "Booking completed."); }
  noShow(id: string) { this.runAction(this.api.noShowBooking(id), "Booking marked no-show."); }
  cancel(id: string) { const reason = prompt("Cancellation reason") || "Cancelled by admin"; this.runAction(this.api.cancelBooking(id, reason), "Booking cancelled."); }
  reject(id: string) { const reason = prompt("Rejection reason") || "Rejected by admin"; this.runAction(this.api.rejectBooking(id, reason), "Booking rejected."); }
  statusClass(status: string) { return status?.toLowerCase()?.replace("_", "-") || ""; }

  private runAction(request: any, successMessage: string) {
    request.subscribe({
      next: () => {
        this.toast.success(successMessage);
        this.load();
      },
      error: (err) => this.toast.error(this.errorMessage(err, "Operation failed.")),
    });
  }

  private errorMessage(err: any, fallback: string): string {
    const message = err?.error?.message || fallback;
    return Array.isArray(message) ? message.join(", ") : message;
  }
}
