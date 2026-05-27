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
          <div class="eyebrow">Admin</div>
          <h1>Boardroom Admin</h1>
          <p class="muted">Create, update and deactivate bookable meeting spaces.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="management-layout">
        <section class="card">
          <h2>Create boardroom</h2>
          <div class="form-grid">
            <div class="field"><label>Name</label><input [(ngModel)]="form.name" placeholder="Executive Boardroom" /></div>
            <div class="field"><label>Code</label><input [(ngModel)]="form.code" placeholder="BR-EXEC-01" /></div>
            <div class="field"><label>Location</label><input [(ngModel)]="form.location" placeholder="Head Office" /></div>
            <div class="field"><label>Capacity</label><input type="number" [(ngModel)]="form.capacity" min="1" /></div>
            <div class="field"><label>Building</label><input [(ngModel)]="form.building" placeholder="Main Building" /></div>
            <div class="field"><label>Floor</label><input [(ngModel)]="form.floor" placeholder="3" /></div>
            <div class="field"><label>Opening time</label><input type="time" [(ngModel)]="form.openingTime" /></div>
            <div class="field"><label>Closing time</label><input type="time" [(ngModel)]="form.closingTime" /></div>
            <div class="field"><label>Minimum minutes</label><input type="number" [(ngModel)]="form.minimumBookingMinutes" /></div>
            <div class="field"><label>Maximum minutes</label><input type="number" [(ngModel)]="form.maximumBookingMinutes" /></div>
          </div>
          <label class="check"><input type="checkbox" [(ngModel)]="form.requiresApproval" /> Requires approval</label>
          <label class="check"><input type="checkbox" [(ngModel)]="form.isBookable" /> Bookable</label>
          <button class="btn full-width" type="button" (click)="create()">Create boardroom</button>
          <div *ngIf="message" class="alert" [class.error]="isError" [class.success]="!isError">{{ message }}</div>
        </section>

        <section class="card">
          <h2>Existing boardrooms</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Location</th><th>Capacity</th><th>Rules</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let room of rooms">
                  <td><strong>{{ room.name }}</strong><br /><span class="muted small">{{ room.code }}</span></td>
                  <td>{{ room.location }}</td>
                  <td>{{ room.capacity }}</td>
                  <td>{{ room.openingTime }} - {{ room.closingTime }}<br />{{ room.requiresApproval ? 'Approval required' : 'Instant approval' }}</td>
                  <td><span class="badge" [class.approved]="room.isActive && room.isBookable">{{ room.isActive && room.isBookable ? 'Active' : 'Inactive' }}</span></td>
                  <td><button class="btn tiny danger" type="button" (click)="deactivate(room.id)">Deactivate</button></td>
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
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.boardrooms().subscribe({ next: (res: any) => (this.rooms = Array.isArray(res) ? res : []), error: () => (this.rooms = []) });
  }

  create() {
    this.api.createBoardroom(this.form).subscribe({
      next: () => {
        this.message = "Boardroom created.";
        this.isError = false;
        this.form.name = "";
        this.form.code = "";
        this.form.location = "";
        this.load();
      },
      error: (err) => this.showError(err?.error?.message || "Could not create boardroom."),
    });
  }

  deactivate(id: string) {
    this.api.deactivateBoardroom(id).subscribe({ next: () => this.load(), error: () => this.showError("Could not deactivate boardroom.") });
  }

  private showError(message: string) {
    this.message = Array.isArray(message) ? message.join(", ") : message;
    this.isError = true;
  }
}
