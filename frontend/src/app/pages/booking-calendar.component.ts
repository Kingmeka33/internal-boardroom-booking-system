import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ApiService } from "../services/api.service";
import { ToastService } from "../services/toast.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page employee-experience">
      <div class="page-header app-page-header">
        <div>
          <div class="eyebrow">Calendar</div>
          <h1>Booking calendar</h1>
          <p class="muted">A calendar-style view of scheduled meetings, pending approvals and cancellations.</p>
        </div>
        <a class="btn" routerLink="/book">Create booking</a>
      </div>

      <div class="card filters calendar-filter-bar">
        <div class="field">
          <label>View</label>
          <select [(ngModel)]="filters.viewMode" (change)="applyViewMode()">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div class="field">
          <label>Room</label>
          <select [(ngModel)]="filters.boardroomId">
            <option value="">All rooms</option>
            <option *ngFor="let room of rooms" [value]="room.id">{{ room.name }}</option>
          </select>
        </div>
        <div class="field">
          <label>Start date</label>
          <input type="date" [(ngModel)]="filters.startDate" />
        </div>
        <div class="field">
          <label>End date</label>
          <input type="date" [(ngModel)]="filters.endDate" />
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
            <option value="ROOM_BLOCK">Room blocks</option>
          </select>
        </div>
        <div class="field action-field">
          <label>&nbsp;</label>
          <button class="btn secondary" type="button" (click)="load()">Apply filters</button>
        </div>
      </div>

      <div class="calendar-board modern-calendar-board">
        <article *ngFor="let day of groupedDays" class="calendar-day-card">
          <div class="calendar-day-header">
            <strong>{{ day.date | date: "EEE, d MMM yyyy" }}</strong>
            <span>{{ day.events.length }} booking(s)</span>
          </div>

          <div *ngFor="let event of day.events" class="calendar-event" [class.pending]="event.status === 'PENDING_APPROVAL'" [class.room-block]="event.status === 'ROOM_BLOCK'">
            <div class="event-time">{{ event.start | date: "HH:mm" }} - {{ event.end | date: "HH:mm" }}</div>
            <strong>{{ event.title }}</strong>
            <span>{{ event.boardroom || "Boardroom" }}</span>
            <span class="badge" [ngClass]="statusClass(event.status)">{{ event.status }}</span>
          </div>
        </article>
      </div>

      <div *ngIf="events.length === 0" class="card empty-state">
        <strong>No bookings found</strong>
        <p>Try a wider date range or create a new booking.</p>
      </div>
    </section>
  `,
})
export class BookingCalendarComponent {
  events: any[] = [];
  groupedDays: { date: Date; events: any[] }[] = [];
  rooms: any[] = [];

  filters = {
    viewMode: "week",
    startDate: this.dateOffset(0),
    endDate: this.dateOffset(7),
    status: "",
    boardroomId: "",
  };

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
    this.api
      .calendar({
        startDateTime: `${this.filters.startDate}T00:00:00.000Z`,
        endDateTime: `${this.filters.endDate}T23:59:59.000Z`,
        status: this.filters.status,
        boardroomId: this.filters.boardroomId,
      })
      .subscribe({
        next: (res: any) => {
          this.events = Array.isArray(res) ? res : [];
          this.groupEvents();
        },
        error: () => {
          this.events = [];
          this.groupedDays = [];
          this.toast.error("Could not load calendar events.");
        },
      });
  }

  applyViewMode() {
    const start = new Date(`${this.filters.startDate}T00:00:00`);
    const end = new Date(start);
    if (this.filters.viewMode === "day") end.setDate(start.getDate());
    if (this.filters.viewMode === "week") end.setDate(start.getDate() + 7);
    if (this.filters.viewMode === "month") end.setMonth(start.getMonth() + 1);
    this.filters.endDate = end.toISOString().slice(0, 10);
  }

  statusClass(status: string): string {
    return status?.toLowerCase()?.replace("_", "-") || "";
  }

  private groupEvents() {
    const groups = new Map<string, any[]>();
    this.events.forEach((event) => {
      const key = new Date(event.start).toISOString().slice(0, 10);
      groups.set(key, [...(groups.get(key) || []), event]);
    });
    this.groupedDays = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, events]) => ({ date: new Date(date), events }));
  }

  private dateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }
}
