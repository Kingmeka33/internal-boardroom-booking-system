import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AppStateComponent } from "./app-state.component";

@Component({
  selector: "app-table",
  standalone: true,
  imports: [CommonModule, AppStateComponent],
  template: `
    <section class="card admin-table-card">
      <div class="section-toolbar" *ngIf="title || subtitle">
        <div>
          <h2 *ngIf="title">{{ title }}</h2>
          <span class="muted small" *ngIf="subtitle">{{ subtitle }}</span>
        </div>
      </div>
      <app-state
        [loading]="loading"
        [error]="error"
        [empty]="empty"
        [emptyTitle]="emptyTitle"
        [emptyText]="emptyText"
        [loadingTitle]="loadingTitle"
        [loadingText]="loadingText"
      >
        <div class="table-wrap">
          <ng-content />
        </div>
      </app-state>
    </section>
  `,
})
export class AppTableComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() loading = false;
  @Input() error = "";
  @Input() empty = false;
  @Input() emptyTitle = "No records found";
  @Input() emptyText = "Try changing your search or creating a new record.";
  @Input() loadingTitle = "Loading";
  @Input() loadingText = "Please wait while the latest information is loaded.";
}
