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
          <div class="eyebrow">Facilities</div>
          <h1>Room Blocks</h1>
          <p class="muted">Block rooms for maintenance, cleaning, setup or executive use.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="management-layout">
        <section class="card">
          <h2>Create room block</h2>
          <div class="field">
            <label>Boardroom</label>
            <select [(ngModel)]="form.boardroomId">
              <option value="">Select boardroom</option>
              <option *ngFor="let room of rooms" [value]="room.id">{{ room.name }} - {{ room.location }}</option>
            </select>
          </div>
          <div class="field"><label>Reason</label><input [(ngModel)]="form.reason" placeholder="Maintenance" /></div>
          <div class="form-grid">
            <div class="field"><label>Start</label><input type="datetime-local" [(ngModel)]="form.startDateTime" /></div>
            <div class="field"><label>End</label><input type="datetime-local" [(ngModel)]="form.endDateTime" /></div>
          </div>
          <button class="btn full-width" type="button" (click)="create()">Create block</button>
          <div *ngIf="message" class="alert" [class.error]="isError" [class.success]="!isError">{{ message }}</div>
        </section>

        <section class="card">
          <h2>Active and historical blocks</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Room</th><th>Reason</th><th>When</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let block of blocks">
                  <td>{{ block.boardroom?.name || 'Room' }}</td>
                  <td>{{ block.reason }}</td>
                  <td>{{ block.startDateTime | date: 'd MMM HH:mm' }} - {{ block.endDateTime | date: 'd MMM HH:mm' }}</td>
                  <td><span class="badge" [class.approved]="block.isActive">{{ block.isActive ? 'Active' : 'Inactive' }}</span></td>
                  <td><button class="btn tiny danger" type="button" (click)="deactivate(block.id)">Deactivate</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="blocks.length === 0" class="empty-inline">No room blocks found.</div>
        </section>
      </div>
    </section>
  `,
})
export class RoomBlocksComponent {
  rooms: any[] = [];
  blocks: any[] = [];
  message = "";
  isError = false;
  form = {
    boardroomId: "",
    reason: "Maintenance",
    startDateTime: "",
    endDateTime: "",
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.boardrooms().subscribe({ next: (res: any) => (this.rooms = Array.isArray(res) ? res : []) });
    this.api.roomBlocks().subscribe({ next: (res: any) => (this.blocks = Array.isArray(res) ? res : []), error: () => (this.blocks = []) });
  }

  create() {
    this.api
      .createRoomBlock({
        ...this.form,
        startDateTime: new Date(this.form.startDateTime).toISOString(),
        endDateTime: new Date(this.form.endDateTime).toISOString(),
      })
      .subscribe({
        next: () => {
          this.message = "Room block created.";
          this.isError = false;
          this.load();
        },
        error: (err) => this.showError(err?.error?.message || "Could not create room block."),
      });
  }

  deactivate(id: string) {
    this.api.deactivateRoomBlock(id).subscribe({ next: () => this.load(), error: () => this.showError("Could not deactivate room block.") });
  }

  private showError(message: string) {
    this.message = Array.isArray(message) ? message.join(", ") : message;
    this.isError = true;
  }
}
