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
          <div class="eyebrow">Facilities</div>
          <h1>Room Blocks</h1>
          <p class="muted">Block rooms for maintenance, cleaning, setup or executive use.</p>
        </div>
        <div class="header-actions">
          <button class="btn" type="button" (click)="openCreateDialog()">Create block</button>
          <button class="btn secondary" type="button" (click)="load()">Refresh</button>
        </div>
      </div>

      <section class="card admin-table-card">
          <div class="section-toolbar">
            <div>
              <h2>Active and historical blocks</h2>
              <span class="muted small">{{ blocks.length }} block records</span>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Room</th><th>Reason</th><th>When</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let block of blocks">
                  <td>{{ block.boardroom?.name || 'Room' }}</td>
                  <td>{{ block.reason }}</td>
                  <td>{{ block.startDateTime | date: 'd MMM HH:mm' }} - {{ block.endDateTime | date: 'd MMM HH:mm' }}</td>
                  <td><span class="badge" [class.approved]="block.isActive">{{ block.isActive ? 'Active' : 'Inactive' }}</span></td>
                  <td>
                    <div class="actions">
                      <button class="btn tiny secondary" type="button" (click)="edit(block)">Edit</button>
                      <button *ngIf="block.isActive" class="btn tiny danger" type="button" (click)="deactivate(block.id)">Deactivate</button>
                      <button *ngIf="!block.isActive" class="btn tiny" type="button" (click)="reactivate(block.id)">Reactivate</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="blocks.length === 0" class="empty-inline">No room blocks found.</div>
      </section>

      <div *ngIf="showBlockDialog" class="dialog-backdrop" role="presentation" (click)="closeDialog()">
        <section class="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="blockDialogTitle" (click)="$event.stopPropagation()">
          <header class="dialog-header">
            <div>
              <div class="eyebrow">{{ editingBlockId ? "Update" : "Create" }}</div>
              <h2 id="blockDialogTitle">{{ editingBlockId ? "Update room block" : "Create room block" }}</h2>
            </div>
            <button class="ghost-btn" type="button" aria-label="Close dialog" (click)="closeDialog()">Close</button>
          </header>

          <div class="dialog-body">
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
            <div *ngIf="message" class="alert" [class.error]="isError" [class.success]="!isError">{{ message }}</div>
          </div>

          <footer class="dialog-footer">
            <button class="btn secondary" type="button" (click)="closeDialog()">Cancel</button>
            <button class="btn" type="button" (click)="saveBlock()">
              {{ editingBlockId ? "Update block" : "Create block" }}
            </button>
          </footer>
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
  showBlockDialog = false;
  editingBlockId = "";
  form = {
    boardroomId: "",
    reason: "Maintenance",
    startDateTime: "",
    endDateTime: "",
  };

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit() {
    this.load();
  }

  openCreateDialog() {
    this.resetForm();
    this.message = "";
    this.isError = false;
    this.showBlockDialog = true;
  }

  closeDialog() {
    this.showBlockDialog = false;
    this.message = "";
    this.isError = false;
    this.resetForm();
  }

  load() {
    this.api.boardrooms().subscribe({ next: (res: any) => (this.rooms = Array.isArray(res) ? res : []) });
    this.api.roomBlocks().subscribe({
      next: (res: any) => (this.blocks = Array.isArray(res) ? res : []),
      error: (err) => {
        this.blocks = [];
        this.showError(this.errorMessage(err, "Could not load room blocks."));
      },
    });
  }

  saveBlock() {
    this.editingBlockId ? this.update() : this.create();
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
          this.toast.success(this.message);
          this.showBlockDialog = false;
          this.resetForm();
          this.load();
        },
        error: (err) => this.showError(this.errorMessage(err, "Could not create room block.")),
      });
  }

  update() {
    this.api
      .updateRoomBlock(this.editingBlockId, {
        ...this.form,
        startDateTime: new Date(this.form.startDateTime).toISOString(),
        endDateTime: new Date(this.form.endDateTime).toISOString(),
      })
      .subscribe({
        next: () => {
          this.message = "Room block updated.";
          this.isError = false;
          this.toast.success(this.message);
          this.showBlockDialog = false;
          this.resetForm();
          this.load();
        },
        error: (err) => this.showError(this.errorMessage(err, "Could not update room block.")),
      });
  }

  edit(block: any) {
    this.editingBlockId = block.id;
    this.form = {
      boardroomId: block.boardroom?.id || "",
      reason: block.reason || "Maintenance",
      startDateTime: this.toLocalInputValue(block.startDateTime),
      endDateTime: this.toLocalInputValue(block.endDateTime),
    };
    this.message = "";
    this.isError = false;
    this.showBlockDialog = true;
  }

  deactivate(id: string) {
    if (!confirm("Deactivate this room block?")) return;
    this.api.deactivateRoomBlock(id).subscribe({
      next: () => {
        this.toast.success("Room block deactivated.");
        this.load();
      },
      error: (err) => this.showError(this.errorMessage(err, "Could not deactivate room block.")),
    });
  }

  reactivate(id: string) {
    this.api.reactivateRoomBlock(id).subscribe({
      next: () => {
        this.toast.success("Room block reactivated.");
        this.load();
      },
      error: (err) => this.showError(this.errorMessage(err, "Could not reactivate room block.")),
    });
  }

  private resetForm() {
    this.editingBlockId = "";
    this.form = {
      boardroomId: "",
      reason: "Maintenance",
      startDateTime: "",
      endDateTime: "",
    };
  }

  private toLocalInputValue(value: string): string {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
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
