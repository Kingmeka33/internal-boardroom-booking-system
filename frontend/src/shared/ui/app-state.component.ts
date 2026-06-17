import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-state",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading" class="empty-state state-card">
      <strong>{{ loadingTitle }}</strong>
      <span>{{ loadingText }}</span>
    </div>

    <div *ngIf="!loading && error" class="empty-state state-card error-state">
      <strong>{{ errorTitle }}</strong>
      <span>{{ error }}</span>
    </div>

    <div *ngIf="!loading && !error && empty" class="empty-state state-card">
      <strong>{{ emptyTitle }}</strong>
      <span>{{ emptyText }}</span>
    </div>

    <ng-content *ngIf="!loading && !error && !empty" />
  `,
})
export class AppStateComponent {
  @Input() loading = false;
  @Input() empty = false;
  @Input() error = "";
  @Input() loadingTitle = "Loading";
  @Input() loadingText = "Please wait while the latest information is loaded.";
  @Input() emptyTitle = "No records";
  @Input() emptyText = "There is nothing to show yet.";
  @Input() errorTitle = "Something went wrong";
}
