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
          <div class="eyebrow">New reservation</div>
          <h1>Create booking</h1>
          <p class="muted">
            Choose a room, select dates from the calendar controls and submit your meeting request.
          </p>
        </div>
        <button class="btn secondary" type="button" (click)="loadRooms()">Refresh rooms</button>
      </div>

      <div class="booking-layout">
        <section class="card booking-panel">
          <h2>1. Select a boardroom</h2>
          <p class="muted small">
            Employees should not type room IDs manually. Select a room from the list below.
          </p>

          <div class="room-select-grid">
            <button
              *ngFor="let room of rooms"
              type="button"
              class="room-choice"
              [class.selected]="form.boardroomId === room.id"
              (click)="selectRoom(room)"
            >
              <strong>{{ room.name }}</strong>
              <span>{{ room.location }} · Capacity {{ room.capacity }}</span>
              <small>{{ room.requiresApproval ? "Approval required" : "Instant approval" }}</small>
            </button>
          </div>

          <div *ngIf="rooms.length === 0" class="empty-inline">
            No rooms loaded yet. Click refresh rooms or check that seeded boardrooms exist.
          </div>
        </section>

        <section class="card booking-panel">
          <h2>2. Choose date and time</h2>
          <div class="form-grid">
            <div class="field">
              <label>Start date and time</label>
              <input type="datetime-local" [(ngModel)]="form.startDateTime" />
            </div>
            <div class="field">
              <label>End date and time</label>
              <input type="datetime-local" [(ngModel)]="form.endDateTime" />
            </div>
          </div>

          <div class="availability-strip">
            <button class="btn secondary" type="button" (click)="checkAvailability()">
              Check available rooms
            </button>
            <span class="muted small">Backend validates conflicts, room blocks and operating hours.</span>
          </div>

          <div *ngIf="availableRooms.length > 0" class="available-list">
            <strong>Available rooms for this time:</strong>
            <button
              *ngFor="let room of availableRooms"
              type="button"
              class="pill-button"
              (click)="selectRoom(room)"
            >
              {{ room.name }} · {{ room.capacity }} seats
            </button>
          </div>
        </section>

        <section class="card booking-panel">
          <h2>3. Meeting details</h2>
          <div class="form-grid">
            <div class="field">
              <label>Meeting title</label>
              <input [(ngModel)]="form.title" placeholder="Planning meeting" />
            </div>
            <div class="field">
              <label>Attendee count</label>
              <input [(ngModel)]="form.attendeeCount" type="number" min="1" />
            </div>
            <div class="field">
              <label>Meeting type</label>
              <select [(ngModel)]="form.meetingType">
                <option value="Internal">Internal</option>
                <option value="External">External</option>
                <option value="Executive">Executive</option>
                <option value="Training">Training</option>
              </select>
            </div>
            <div class="field">
              <label>Selected room</label>
              <input [value]="selectedRoomLabel()" readonly />
            </div>
          </div>

          <div class="field">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" placeholder="Optional meeting notes"></textarea>
          </div>

          <div class="form-grid compact">
            <label class="check">
              <input type="checkbox" [(ngModel)]="form.requiresCatering" /> Catering required
            </label>
            <label class="check">
              <input type="checkbox" [(ngModel)]="form.requiresSetup" /> Setup required
            </label>
          </div>

          <button class="btn full-width" type="button" (click)="create()">Submit booking</button>
          <div *ngIf="message" class="alert" [class.error]="isError" [class.success]="!isError">
            {{ message }}
          </div>
        </section>

        <aside class="card helper-card">
          <h2>Booking rules</h2>
          <ul>
            <li>Use the date picker instead of typing raw ISO strings.</li>
            <li>Select a room by name; the system sends the ID automatically.</li>
            <li>Pending and approved bookings block availability.</li>
            <li>Room maintenance blocks also prevent bookings.</li>
            <li>Rooms that require approval create pending requests.</li>
          </ul>
        </aside>
      </div>
    </section>
  `,
})
export class BookingFormComponent {
  rooms: any[] = [];
  availableRooms: any[] = [];
  message = "";
  isError = false;

  form = {
    boardroomId: "",
    title: "",
    description: "",
    startDateTime: this.localDateTimeOffset(1, 9, 0),
    endDateTime: this.localDateTimeOffset(1, 10, 0),
    attendeeCount: 1,
    meetingType: "Internal",
    requiresCatering: false,
    cateringNotes: "",
    requiresSetup: false,
    setupNotes: "",
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.api.boardrooms().subscribe({
      next: (res: any) => {
        this.rooms = Array.isArray(res) ? res : [];
        if (!this.form.boardroomId && this.rooms.length > 0) {
          this.form.boardroomId = this.rooms[0].id;
        }
      },
      error: () => {
        this.rooms = [];
        this.showError("Could not load boardrooms. Please check the backend.");
      },
    });
  }

  selectRoom(room: any) {
    this.form.boardroomId = room.id;
  }

  checkAvailability() {
    this.availableRooms = [];
    this.api
      .availableBoardrooms({
        startDateTime: this.toIso(this.form.startDateTime),
        endDateTime: this.toIso(this.form.endDateTime),
        capacity: Number(this.form.attendeeCount),
      })
      .subscribe({
        next: (res: any) => {
          this.availableRooms = Array.isArray(res) ? res : [];
          if (this.availableRooms.length === 0) {
            this.showError("No available rooms found for the selected time.");
          } else {
            this.message = `${this.availableRooms.length} room(s) available for this time.`;
            this.isError = false;
          }
        },
        error: (err) => this.showError(err?.error?.message || "Availability check failed."),
      });
  }

  create() {
    this.api
      .createBooking({
        ...this.form,
        startDateTime: this.toIso(this.form.startDateTime),
        endDateTime: this.toIso(this.form.endDateTime),
        attendeeCount: Number(this.form.attendeeCount),
      })
      .subscribe({
        next: () => {
          this.message = "Booking submitted successfully.";
          this.isError = false;
        },
        error: (err) => this.showError(err?.error?.message || "Booking failed."),
      });
  }

  selectedRoomLabel(): string {
    const room = this.rooms.find((item) => item.id === this.form.boardroomId);
    return room ? `${room.name} - ${room.location} - ${room.capacity} seats` : "No room selected";
  }

  private showError(message: string) {
    this.message = Array.isArray(message) ? message.join(", ") : message;
    this.isError = true;
  }

  private toIso(value: string): string {
    return new Date(value).toISOString();
  }

  private localDateTimeOffset(daysFromToday: number, hour: number, minute: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(hour, minute, 0, 0);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }
}
