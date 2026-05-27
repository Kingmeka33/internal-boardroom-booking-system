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
          <div class="eyebrow">Administration</div>
          <h1>Settings</h1>
          <p class="muted">Configure booking duration, after-hours rules, reminders and workflow behaviour.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <section class="card table-wrap">
        <table>
          <thead><tr><th>Setting</th><th>Value</th><th>Description</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let setting of settings">
              <td><strong>{{ setting.key }}</strong></td>
              <td><input [(ngModel)]="setting.value" /></td>
              <td>{{ setting.description || '-' }}</td>
              <td><button class="btn tiny" type="button" (click)="save(setting)">Save</button></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="settings.length === 0" class="empty-inline">No system settings found.</div>
      </section>
    </section>
  `,
})
export class SettingsComponent {
  settings: any[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.systemSettings().subscribe({
      next: (res: any) => (this.settings = Array.isArray(res) ? res : []),
      error: () => (this.settings = []),
    });
  }

  save(setting: any) {
    this.api.updateSystemSetting(setting.key, setting.value).subscribe({ next: () => this.load() });
  }
}
