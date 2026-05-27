import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ApiService } from "../services/api.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="page-header">
        <div>
          <div class="eyebrow">Find a space</div>
          <h1>Boardrooms</h1>
          <p class="muted">Search by location, capacity and availability.</p>
        </div>
        <button class="btn secondary" type="button" (click)="loadRooms()">Load rooms</button>
      </div>

      <div class="card filters">
        <div class="field">
          <label>Location</label>
          <input [(ngModel)]="filters.location" placeholder="Building or location" />
        </div>
        <div class="field">
          <label>Minimum capacity</label>
          <input [(ngModel)]="filters.capacity" type="number" min="1" />
        </div>
        <div class="field">
          <label>Start date and time</label>
          <input type="datetime-local" [(ngModel)]="filters.startDateTime" />
        </div>
        <div class="field">
          <label>End date and time</label>
          <input type="datetime-local" [(ngModel)]="filters.endDateTime" />
        </div>
        <div class="field action-field">
          <label>&nbsp;</label>
          <button class="btn" type="button" (click)="searchAvailable()">Search availability</button>
        </div>
      </div>

      <div class="room-card-grid">
        <article *ngFor="let room of rooms" class="room-card">
          <div class="room-card-top">
            <div>
              <h3>{{ room.name }}</h3>
              <p>{{ room.location }} · {{ room.building || "Building" }} · Floor {{ room.floor || "-" }}</p>
            </div>
            <span class="badge" [class.approved]="room.isBookable">{{ room.isBookable ? "Bookable" : "Blocked" }}</span>
          </div>
          <div class="room-meta">
            <span>Capacity {{ room.capacity }}</span>
            <span>{{ room.openingTime }} - {{ room.closingTime }}</span>
            <span>{{ room.requiresApproval ? "Needs approval" : "Instant approval" }}</span>
          </div>
          <div class="amenity-row">
            <span *ngFor="let amenity of room.amenities || []" class="mini-chip">{{ amenity.name }}</span>
          </div>
          <a class="btn secondary" routerLink="/book">Book this room</a>
        </article>
      </div>

      <div *ngIf="rooms.length === 0" class="card empty-state">
        <strong>No boardrooms found</strong>
        <p>Try loading rooms or ask an admin to create boardrooms.</p>
      </div>
    </section>
  `,
})
export class BoardroomsComponent {
  rooms: any[] = [];
  filters = {
    location: "",
    capacity: 1,
    startDateTime: "",
    endDateTime: "",
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.api.boardrooms().subscribe({
      next: (res: any) => (this.rooms = Array.isArray(res) ? res : []),
      error: () => (this.rooms = []),
    });
  }

  searchAvailable() {
    this.api
      .availableBoardrooms({
        location: this.filters.location,
        capacity: this.filters.capacity,
        startDateTime: this.filters.startDateTime ? new Date(this.filters.startDateTime).toISOString() : "",
        endDateTime: this.filters.endDateTime ? new Date(this.filters.endDateTime).toISOString() : "",
      })
      .subscribe({
        next: (res: any) => (this.rooms = Array.isArray(res) ? res : []),
        error: () => (this.rooms = []),
      });
  }
}
