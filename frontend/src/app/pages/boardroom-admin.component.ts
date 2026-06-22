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
          <div class="eyebrow">Admin</div>
          <h1>Boardroom Admin</h1>
          <p class="muted">Create, update and deactivate bookable meeting spaces.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="management-layout admin-management-layout">
        <section class="card admin-editor-card">
          <h2>Create boardroom</h2>
          <div class="form-grid">
            <div class="field"><label>Name</label><input [(ngModel)]="form.name" placeholder="Executive Boardroom" /></div>
            <div class="field"><label>Code</label><input [(ngModel)]="form.code" placeholder="BR-EXEC-01" /></div>
            <div class="field"><label>Location</label><input [(ngModel)]="form.location" placeholder="Head Office" /></div>
            <div class="field"><label>Capacity</label><input type="number" [(ngModel)]="form.capacity" min="1" /></div>
            <div class="field"><label>Building</label><input [(ngModel)]="form.building" placeholder="Main Building" /></div>
            <div class="field"><label>Floor</label><input [(ngModel)]="form.floor" placeholder="3" /></div>
            <div class="field"><label>Image URL</label><input [(ngModel)]="form.imageUrl" placeholder="https://example.com/room.jpg" /></div>
            <div class="field"><label>Opening time</label><input type="time" [(ngModel)]="form.openingTime" /></div>
            <div class="field"><label>Closing time</label><input type="time" [(ngModel)]="form.closingTime" /></div>
            <div class="field"><label>Minimum minutes</label><input type="number" [(ngModel)]="form.minimumBookingMinutes" /></div>
            <div class="field"><label>Maximum minutes</label><input type="number" [(ngModel)]="form.maximumBookingMinutes" /></div>
            <div class="field"><label>Early arrival buffer</label><input type="number" [(ngModel)]="form.bufferTimeBeforeMinutes" min="0" /></div>
            <div class="field"><label>Late departure buffer</label><input type="number" [(ngModel)]="form.bufferTimeAfterMinutes" min="0" /></div>
          </div>
          <div class="field">
            <label>Amenities</label>
            <div class="check-row">
              <label class="check" *ngFor="let amenity of activeAmenities()">
                <input type="checkbox" [checked]="form.amenityIds.includes(amenity.id)" (change)="toggleFormAmenity(amenity.id)" />
                {{ amenity.name }}
              </label>
            </div>
          </div>
          <label class="check"><input type="checkbox" [(ngModel)]="form.requiresApproval" /> Requires approval</label>
          <label class="check"><input type="checkbox" [(ngModel)]="form.isBookable" /> Bookable</label>
          <button class="btn full-width" type="button" (click)="create()">Create boardroom</button>
          <div *ngIf="message" class="alert" [class.error]="isError" [class.success]="!isError">{{ message }}</div>
        </section>

        <section class="card admin-table-card">
          <div class="section-toolbar">
            <div>
              <h2>Existing boardrooms</h2>
              <span class="muted small">{{ rooms.length }} spaces configured</span>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Location</th><th>Capacity</th><th>Amenities</th><th>Rules</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let room of rooms">
                  <td>
                    <img class="table-thumb" [src]="roomImage(room)" [alt]="room.name" />
                    <strong>{{ room.name }}</strong><br /><span class="muted small">{{ room.code }}</span>
                  </td>
                  <td>{{ room.location }}</td>
                  <td>{{ room.capacity }}</td>
                  <td>
                    <div class="check-row compact-checks">
                      <label class="check" *ngFor="let amenity of activeAmenities()">
                        <input type="checkbox" [checked]="roomHasAmenity(room, amenity.id)" (change)="toggleRoomAmenity(room, amenity.id)" />
                        {{ amenity.name }}
                      </label>
                    </div>
                  </td>
                  <td>
                    {{ room.openingTime }} - {{ room.closingTime }}<br />
                    {{ room.requiresApproval ? 'Approval required' : 'Instant approval' }}<br />
                    <span class="muted small">Buffer: {{ room.bufferTimeBeforeMinutes || 0 }} min before, {{ room.bufferTimeAfterMinutes || 0 }} min after</span>
                  </td>
                  <td><span class="badge" [class.approved]="room.isActive && room.isBookable">{{ room.isActive && room.isBookable ? 'Active' : 'Inactive' }}</span></td>
                  <td>
                    <div class="actions">
                      <button class="btn tiny secondary" type="button" (click)="saveAmenities(room)">Save amenities</button>
                      <button *ngIf="room.isActive" class="btn tiny danger" type="button" (click)="deactivate(room.id)">Deactivate</button>
                      <button *ngIf="!room.isActive" class="btn tiny" type="button" (click)="reactivate(room.id)">Reactivate</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `,
})
export class BoardroomAdminComponent {
  rooms: any[] = [];
  amenities: any[] = [];
  message = "";
  isError = false;
  form = {
    name: "",
    code: "",
    description: "",
    location: "",
    floor: "",
    building: "",
    capacity: 8,
    imageUrl: "",
    isBookable: true,
    requiresApproval: false,
    openingTime: "08:00",
    closingTime: "17:00",
    minimumBookingMinutes: 15,
    maximumBookingMinutes: 240,
    bufferTimeBeforeMinutes: 0,
    bufferTimeAfterMinutes: 0,
    amenityIds: [] as string[],
  };

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.boardrooms().subscribe({
      next: (res: any) => (this.rooms = Array.isArray(res) ? res : []),
      error: (err) => {
        this.rooms = [];
        this.showError(this.errorMessage(err, "Could not load boardrooms."));
      },
    });
    this.api.amenities().subscribe({
      next: (res: any) => (this.amenities = Array.isArray(res) ? res : []),
      error: () => (this.amenities = []),
    });
  }

  create() {
    this.api.createBoardroom(this.form).subscribe({
      next: () => {
        this.message = "Boardroom created.";
        this.isError = false;
        this.toast.success(this.message);
        this.form.name = "";
        this.form.code = "";
        this.form.location = "";
        this.form.imageUrl = "";
        this.form.amenityIds = [];
        this.load();
      },
      error: (err) => this.showError(this.errorMessage(err, "Could not create boardroom.")),
    });
  }

  deactivate(id: string) {
    this.api.deactivateBoardroom(id).subscribe({
      next: () => {
        this.toast.success("Boardroom deactivated.");
        this.load();
      },
      error: (err) => this.showError(this.errorMessage(err, "Could not deactivate boardroom.")),
    });
  }

  reactivate(id: string) {
    this.api.reactivateBoardroom(id).subscribe({
      next: () => {
        this.toast.success("Boardroom reactivated.");
        this.load();
      },
      error: (err) => this.showError(this.errorMessage(err, "Could not reactivate boardroom.")),
    });
  }

  activeAmenities() {
    return this.amenities.filter((amenity) => amenity.isActive);
  }

  toggleFormAmenity(id: string) {
    this.form.amenityIds = this.form.amenityIds.includes(id)
      ? this.form.amenityIds.filter((item) => item !== id)
      : [...this.form.amenityIds, id];
  }

  roomHasAmenity(room: any, amenityId: string) {
    return (room.amenities || []).some((amenity) => amenity.id === amenityId);
  }

  toggleRoomAmenity(room: any, amenityId: string) {
    room.amenities = this.roomHasAmenity(room, amenityId)
      ? (room.amenities || []).filter((amenity) => amenity.id !== amenityId)
      : [...(room.amenities || []), this.amenities.find((amenity) => amenity.id === amenityId)];
  }

  saveAmenities(room: any) {
    const amenityIds = (room.amenities || []).filter(Boolean).map((amenity) => amenity.id);
    this.api.assignBoardroomAmenities(room.id, amenityIds).subscribe({
      next: () => {
        this.toast.success("Boardroom amenities updated.");
        this.load();
      },
      error: (err) => this.showError(this.errorMessage(err, "Could not update boardroom amenities.")),
    });
  }

  roomImage(room: any): string {
    return (
      room?.imageUrl ||
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=500&q=80"
    );
  }

  private showError(message: string) {
    this.message = Array.isArray(message) ? message.join(", ") : message;
    this.isError = true;
    this.toast.error(this.message);
  }

  private errorMessage(err: any, fallback: string): string {
    const message = err?.error?.message || fallback;
    return Array.isArray(message) ? message.join(", ") : message;
  }
}
