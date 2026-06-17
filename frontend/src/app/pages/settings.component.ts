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
          <div class="eyebrow">Administration</div>
          <h1>Settings</h1>
          <p class="muted">Configure booking duration, after-hours rules, reminders and workflow behaviour.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <section class="card table-wrap admin-table-card">
        <div class="section-toolbar">
          <div>
            <h2>Workflow settings</h2>
            <span class="muted small">{{ settings.length }} configuration values</span>
          </div>
        </div>
        <table>
          <thead><tr><th>Setting</th><th>Value</th><th>Description</th><th>Action</th></tr></thead>
          <tbody>
            <tr *ngFor="let setting of settings">
              <td><strong>{{ setting.key }}</strong></td>
              <td class="settings-value-cell">
                <select *ngIf="isBooleanSetting(setting)" [(ngModel)]="setting.value">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                <input *ngIf="!isBooleanSetting(setting)" [(ngModel)]="setting.value" />
              </td>
              <td>{{ setting.description || '-' }}</td>
              <td class="settings-action-cell">
                <button class="btn tiny" type="button" [disabled]="savingKey === setting.key" (click)="save(setting)">
                  {{ savingKey === setting.key ? "Saving" : "Save" }}
                </button>
              </td>
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
  savingKey = "";

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.systemSettings().subscribe({
      next: (res: any) => (this.settings = Array.isArray(res) ? res : []),
      error: (err) => {
        this.settings = [];
        this.toast.error(this.errorMessage(err, "Could not load settings."));
      },
    });
  }

  save(setting: any) {
    this.savingKey = setting.key;
    this.api.updateSystemSetting(setting.key, setting.value).subscribe({
      next: () => {
        this.toast.success("Setting saved.");
        this.savingKey = "";
        this.load();
      },
      error: (err) => {
        this.savingKey = "";
        this.toast.error(this.errorMessage(err, "Could not save setting."));
      },
    });
  }

  isBooleanSetting(setting: any): boolean {
    return ["true", "false"].includes(String(setting?.value).toLowerCase());
  }

  private errorMessage(err: any, fallback: string): string {
    const message = err?.error?.message || fallback;
    return Array.isArray(message) ? message.join(", ") : message;
  }
}
