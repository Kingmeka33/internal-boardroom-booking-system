import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../services/api.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <div class="eyebrow">Governance</div>
          <h1>All Bookings</h1>
          <p class="muted">Review, approve, reject, cancel, complete and mark no-show bookings.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="card filters">
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
        <div class="field action-field"><label>&nbsp;</label><button class="btn" type="button" (click)="load()">Apply</button></div>
      </div>

      <section class="card">
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
  filters = { status: "" };

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.allBookings(this.filters).subscribe({ next: (res: any) => (this.bookings = Array.isArray(res) ? res : []), error: () => (this.bookings = []) });
  }

  approve(id: string) { this.api.approveBooking(id).subscribe({ next: () => this.load() }); }
  complete(id: string) { this.api.completeBooking(id).subscribe({ next: () => this.load() }); }
  noShow(id: string) { this.api.noShowBooking(id).subscribe({ next: () => this.load() }); }
  cancel(id: string) { const reason = prompt("Cancellation reason") || "Cancelled by admin"; this.api.cancelBooking(id, reason).subscribe({ next: () => this.load() }); }
  reject(id: string) { const reason = prompt("Rejection reason") || "Rejected by admin"; this.api.rejectBooking(id, reason).subscribe({ next: () => this.load() }); }
  statusClass(status: string) { return status?.toLowerCase()?.replace("_", "-") || ""; }
}
