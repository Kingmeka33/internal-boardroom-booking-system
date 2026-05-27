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
          <div class="eyebrow">Governance</div>
          <h1>Audit Logs</h1>
          <p class="muted">Trace sensitive booking, boardroom, user and system setting actions.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="card filters">
        <div class="field"><label>Entity</label><input [(ngModel)]="filters.entityName" placeholder="Booking" /></div>
        <div class="field"><label>Action</label><input [(ngModel)]="filters.action" placeholder="BOOKING_CREATED" /></div>
        <div class="field action-field"><label>&nbsp;</label><button class="btn" type="button" (click)="load()">Search</button></div>
      </div>

      <section class="card table-wrap">
        <table>
          <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Actor</th><th>Record</th></tr></thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td>{{ log.createdAt | date: 'd MMM yyyy HH:mm' }}</td>
              <td><strong>{{ log.action }}</strong></td>
              <td>{{ log.entityName }}</td>
              <td>{{ log.actorUserId || '-' }}</td>
              <td>{{ log.entityId || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="logs.length === 0" class="empty-inline">No audit records found.</div>
      </section>
    </section>
  `,
})
export class AuditLogsComponent {
  logs: any[] = [];
  filters = { entityName: "", action: "" };
  constructor(private readonly api: ApiService) {}
  ngOnInit() { this.load(); }
  load() { this.api.auditLogs(this.filters).subscribe({ next: (res: any) => (this.logs = Array.isArray(res) ? res : []), error: () => (this.logs = []) }); }
}
