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
          <div class="eyebrow">Module</div>
          <h1>Amenities</h1>
          <p class="muted">Manage projector, TV, Wi-Fi, whiteboard, sound system and video conferencing options.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="management-layout">
        <section class="card">
          <h2>Add amenity</h2>
          <div class="field">
            <label>Name</label>
            <input [(ngModel)]="form.name" placeholder="Video conferencing" />
          </div>
          <div class="field">
            <label>Description</label>
            <textarea [(ngModel)]="form.description" placeholder="Available for hybrid meetings"></textarea>
          </div>
          <div class="field">
            <label>Icon</label>
            <input [(ngModel)]="form.icon" placeholder="video" />
          </div>
          <button class="btn full-width" type="button" (click)="create()">Create amenity</button>
          <div *ngIf="message" class="alert" [class.error]="isError" [class.success]="!isError">{{ message }}</div>
        </section>

        <section class="card">
          <h2>Configured amenities</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Description</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let amenity of amenities">
                  <td><strong>{{ amenity.name }}</strong></td>
                  <td>{{ amenity.description || '-' }}</td>
                  <td><span class="badge" [class.approved]="amenity.isActive">{{ amenity.isActive ? 'Active' : 'Inactive' }}</span></td>
                  <td><button class="btn tiny danger" type="button" (click)="deactivate(amenity.id)">Deactivate</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="amenities.length === 0" class="empty-inline">No amenities found.</div>
        </section>
      </div>
    </section>
  `,
})
export class AmenitiesAdminComponent {
  amenities: any[] = [];
  form = { name: "", description: "", icon: "" };
  message = "";
  isError = false;

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.amenities().subscribe({
      next: (res: any) => (this.amenities = Array.isArray(res) ? res : []),
      error: () => (this.amenities = []),
    });
  }

  create() {
    this.api.createAmenity(this.form).subscribe({
      next: () => {
        this.form = { name: "", description: "", icon: "" };
        this.message = "Amenity created.";
        this.isError = false;
        this.load();
      },
      error: (err) => this.showError(err?.error?.message || "Could not create amenity."),
    });
  }

  deactivate(id: string) {
    this.api.deactivateAmenity(id).subscribe({
      next: () => this.load(),
      error: () => this.showError("Could not deactivate amenity."),
    });
  }

  private showError(message: string) {
    this.message = Array.isArray(message) ? message.join(", ") : message;
    this.isError = true;
  }
}
