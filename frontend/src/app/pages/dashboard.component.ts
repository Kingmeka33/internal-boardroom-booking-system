import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../services/toast.service";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page employee-experience">
      <div class="page-header app-page-header">
        <div>
          <div class="eyebrow">Operations overview</div>
          <h1>Dashboard</h1>
          <p class="muted">Track usage, pending approvals and booking activity.</p>
        </div>
        <div class="header-actions">
          <span class="status-pill">{{ isEmployee() ? "Personal view" : "Operational view" }}</span>
          <button class="btn secondary" type="button" (click)="load()">Refresh</button>
        </div>
      </div>

      <div class="grid grid-4">
        <article class="card stat-card"><div class="stat-label">Bookings today</div><div class="stat-value">{{ summary?.bookingsToday || 0 }}</div><p class="muted small">Reservations from midnight onward</p></article>
        <article class="card stat-card"><div class="stat-label">Pending approvals</div><div class="stat-value">{{ summary?.pendingApprovals || 0 }}</div><p class="muted small">Requests waiting for action</p></article>
        <article class="card stat-card"><div class="stat-label">Active rooms</div><div class="stat-value">{{ summary?.activeBoardrooms || 0 }}</div><p class="muted small">Bookable room inventory</p></article>
        <article class="card stat-card"><div class="stat-label">This month</div><div class="stat-value">{{ summary?.bookingsThisMonth || 0 }}</div><p class="muted small">Current month activity</p></article>
      </div>

      <div class="dashboard-command-grid dashboard-spaced">
        <article class="card command-card">
          <h2>Quick actions</h2>
          <p class="muted">Start the most common workflows from one place.</p>
          <div class="quick-actions">
            <a class="btn" routerLink="/book">Create booking</a>
            <a class="btn secondary" routerLink="/calendar">Open calendar</a>
            <a *ngIf="isOperationalUser()" class="btn secondary" routerLink="/admin/bookings">Review bookings</a>
            <a *ngIf="isOperationalUser()" class="btn secondary" routerLink="/room-blocks">Block a room</a>
          </div>
        </article>

        <article class="card">
          <ng-container *ngIf="isEmployee(); else operationalStatusSummary">
            <h2>My booking status</h2>
            <p class="muted small">Pending, approved and rejected booking requests.</p>
            <div class="chart-list compact-chart">
              <div *ngFor="let row of employeeStatusRows()" class="chart-row">
                <div class="chart-label">
                  <span>{{ statusLabel(row.status) }}</span>
                  <strong>{{ numericCount(row.count) }}</strong>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [class.pending]="row.status === 'PENDING_APPROVAL'"
                    [class.approved]="row.status === 'APPROVED'"
                    [class.rejected]="row.status === 'REJECTED'"
                    [style.width.%]="barPercent(numericCount(row.count), maxEmployeeStatusCount())"
                  ></div>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #operationalStatusSummary>
            <h2>Bookings by status</h2>
            <div class="status-meter-list">
              <div *ngFor="let row of bookingsByStatus" class="metric-row">
                <span>{{ statusLabel(row.status) }}</span><strong>{{ numericCount(row.count) }}</strong>
              </div>
            </div>
            <p *ngIf="bookingsByStatus.length === 0" class="muted">No report data yet.</p>
          </ng-template>
        </article>
      </div>

      <div *ngIf="isOperationalUser()" class="dashboard-command-grid dashboard-spaced">
        <article class="card">
          <h2>Most used rooms</h2>
          <p class="muted small">Rooms with the highest booking count.</p>
          <div class="chart-list">
            <div *ngFor="let row of mostUsedRooms" class="chart-row">
              <div class="chart-label">
                <span>{{ row.room || "Unassigned" }}</span>
                <strong>{{ numericCount(row.bookingCount) }} bookings</strong>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  [style.width.%]="barPercent(numericCount(row.bookingCount), maxRoomCount(mostUsedRooms))"
                ></div>
              </div>
            </div>
          </div>
          <p *ngIf="mostUsedRooms.length === 0" class="muted">No utilisation data yet.</p>
        </article>

        <article class="card">
          <h2>Least used rooms</h2>
          <p class="muted small">Rooms with the lowest booking count.</p>
          <div class="chart-list">
            <div *ngFor="let row of leastUsedRooms" class="chart-row">
              <div class="chart-label">
                <span>{{ row.room || "Unassigned" }}</span>
                <strong>{{ numericCount(row.bookingCount) }} bookings</strong>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill muted-fill"
                  [style.width.%]="barPercent(numericCount(row.bookingCount), maxRoomCount(leastUsedRooms))"
                ></div>
              </div>
            </div>
          </div>
          <p *ngIf="leastUsedRooms.length === 0" class="muted">No utilisation data yet.</p>
        </article>
      </div>

      <div *ngIf="isOperationalUser()" class="dashboard-command-grid dashboard-spaced">
        <article class="card">
          <h2>Department activity</h2>
          <div class="metric-row" *ngFor="let row of bookingsByDepartment">
            <span>{{ row.department || "Unassigned" }}</span>
            <strong>{{ row.count || 0 }}</strong>
          </div>
          <p *ngIf="bookingsByDepartment.length === 0" class="muted">No department data yet.</p>
        </article>

        <article class="card">
          <h2>Peak hours</h2>
          <div class="metric-row" *ngFor="let row of peakHours">
            <span>{{ row.hour }}:00</span>
            <strong>{{ row.count || 0 }}</strong>
          </div>
          <p *ngIf="peakHours.length === 0" class="muted">No peak-hour data yet.</p>
        </article>
      </div>

      <article *ngIf="isOperationalUser()" class="card dashboard-spaced">
        <h2>Cancellations and no-shows</h2>
        <div class="metric-row" *ngFor="let row of cancellationNoShow">
          <span>{{ row.status }}</span>
          <strong>{{ row.count || 0 }}</strong>
        </div>
        <p *ngIf="cancellationNoShow.length === 0" class="muted">No cancellations or no-shows recorded.</p>
      </article>

      <article *ngIf="isEmployee()" class="card dashboard-spaced">
        <h2>My next bookings</h2>
        <div class="metric-row" *ngFor="let booking of upcomingBookings">
          <span>{{ booking.title }} · {{ booking.boardroom?.name || "Boardroom" }}</span>
          <strong>{{ booking.startDateTime | date: 'd MMM HH:mm' }}</strong>
        </div>
        <p *ngIf="upcomingBookings.length === 0" class="muted">No upcoming bookings yet.</p>
      </article>
    </section>
  `,
})
export class DashboardComponent {
  summary: any;
  bookingsByStatus: any[] = [];
  bookingsByDepartment: any[] = [];
  peakHours: any[] = [];
  mostUsedRooms: any[] = [];
  leastUsedRooms: any[] = [];
  cancellationNoShow: any[] = [];
  upcomingBookings: any[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.dashboard().subscribe({
      next: (res) => {
        this.summary = res;
        this.toast.success("Dashboard refreshed.");
      },
      error: (err) => {
        this.summary = {};
        this.toast.error(this.errorMessage(err, "Could not load dashboard."));
      },
    });
    this.api.bookingsByStatus().subscribe({
      next: (res: any) => (this.bookingsByStatus = Array.isArray(res) ? res : []),
      error: (err) => {
        this.bookingsByStatus = [];
        this.toast.error(this.errorMessage(err, "Could not load booking status report."));
      },
    });
    if (this.isOperationalUser()) {
      this.loadOperationalReports();
    }
    if (this.isEmployee()) {
      this.api.myBookings().subscribe({
        next: (res: any) => {
          const now = new Date();
          this.upcomingBookings = (Array.isArray(res) ? res : [])
            .filter((booking) => new Date(booking.startDateTime) >= now)
            .slice(0, 5);
        },
        error: () => (this.upcomingBookings = []),
      });
    }
  }

  private loadOperationalReports() {
    this.api.bookingsByDepartment().subscribe({
      next: (res: any) => (this.bookingsByDepartment = Array.isArray(res) ? res : []),
      error: () => (this.bookingsByDepartment = []),
    });
    this.api.peakHours().subscribe({
      next: (res: any) => (this.peakHours = Array.isArray(res) ? res : []),
      error: () => (this.peakHours = []),
    });
    this.api.mostUsedRooms().subscribe({
      next: (res: any) => (this.mostUsedRooms = Array.isArray(res) ? res.slice(0, 5) : []),
      error: () => (this.mostUsedRooms = []),
    });
    this.api.leastUsedRooms().subscribe({
      next: (res: any) => (this.leastUsedRooms = Array.isArray(res) ? res.slice(0, 5) : []),
      error: () => (this.leastUsedRooms = []),
    });
    this.api.cancellationNoShow().subscribe({
      next: (res: any) => (this.cancellationNoShow = Array.isArray(res) ? res : []),
      error: () => (this.cancellationNoShow = []),
    });
  }

  isOperationalUser(): boolean {
    return ["ADMIN", "SUPER_ADMIN", "FACILITIES_MANAGER"].includes(this.auth.getUser()?.role || "");
  }

  isEmployee(): boolean {
    return this.auth.getUser()?.role === "EMPLOYEE";
  }

  employeeStatusRows() {
    return ["PENDING_APPROVAL", "APPROVED", "REJECTED"].map((status) => {
      const row = this.bookingsByStatus.find((item) => item.status === status);
      return { status, count: row?.count || 0 };
    });
  }

  maxEmployeeStatusCount(): number {
    return Math.max(...this.employeeStatusRows().map((row) => this.numericCount(row.count)), 1);
  }

  maxRoomCount(rows: any[]): number {
    return Math.max(...rows.map((row) => this.numericCount(row.bookingCount)), 1);
  }

  barPercent(value: number, max: number): number {
    if (value <= 0) return 2;
    return Math.max(8, Math.min(100, (value / Math.max(max, 1)) * 100));
  }

  numericCount(value: unknown): number {
    const count = Number(value);
    return Number.isFinite(count) ? count : 0;
  }

  statusLabel(status: string): string {
    return (status || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private errorMessage(err: any, fallback: string): string {
    const message = err?.error?.message || fallback;
    return Array.isArray(message) ? message.join(", ") : message;
  }
}
