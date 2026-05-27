import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <div class="eyebrow">Operations overview</div>
          <h1>Dashboard</h1>
          <p class="muted">Track usage, pending approvals and booking activity.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="grid grid-4">
        <article class="card"><div class="stat-label">Bookings today</div><div class="stat-value">{{ summary?.bookingsToday || 0 }}</div></article>
        <article class="card"><div class="stat-label">Pending approvals</div><div class="stat-value">{{ summary?.pendingApprovals || 0 }}</div></article>
        <article class="card"><div class="stat-label">Active rooms</div><div class="stat-value">{{ summary?.activeBoardrooms || 0 }}</div></article>
        <article class="card"><div class="stat-label">This month</div><div class="stat-value">{{ summary?.bookingsThisMonth || 0 }}</div></article>
      </div>

      <div class="grid grid-2 dashboard-spaced">
        <article class="card">
          <h2>Quick actions</h2>
          <div class="quick-actions">
            <a class="btn" routerLink="/book">Create booking</a>
            <a class="btn secondary" routerLink="/calendar">Open calendar</a>
            <a *ngIf="isOperationalUser()" class="btn secondary" routerLink="/admin/bookings">Review bookings</a>
            <a *ngIf="isOperationalUser()" class="btn secondary" routerLink="/room-blocks">Block a room</a>
          </div>
        </article>

        <article class="card">
          <h2>Bookings by status</h2>
          <div *ngFor="let row of bookingsByStatus" class="metric-row">
            <span>{{ row.status }}</span><strong>{{ row.count }}</strong>
          </div>
          <p *ngIf="bookingsByStatus.length === 0" class="muted">No report data yet.</p>
        </article>
      </div>
    </section>
  `,
})
export class DashboardComponent {
  summary: any;
  bookingsByStatus: any[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.dashboard().subscribe({ next: (res) => (this.summary = res), error: () => (this.summary = {}) });
    this.api.bookingsByStatus().subscribe({ next: (res: any) => (this.bookingsByStatus = Array.isArray(res) ? res : []), error: () => (this.bookingsByStatus = []) });
  }

  isOperationalUser(): boolean {
    return ["ADMIN", "SUPER_ADMIN", "FACILITIES_MANAGER"].includes(this.auth.getUser()?.role || "");
  }
}
