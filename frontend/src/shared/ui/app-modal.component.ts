import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-backdrop" role="presentation" (click)="closed.emit()">
      <section
        class="dialog-panel"
        [ngClass]="panelClass"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        (click)="$event.stopPropagation()"
      >
        <header class="dialog-header">
          <div>
            <div class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</div>
            <h2 [id]="titleId">{{ title }}</h2>
          </div>
          <button class="ghost-btn" type="button" [attr.aria-label]="closeLabel" (click)="closed.emit()">
            {{ closeText }}
          </button>
        </header>

        <div class="dialog-body">
          <ng-content />
        </div>

        <footer class="dialog-footer" *ngIf="showFooter">
          <ng-content select="[modalFooter]" />
        </footer>
      </section>
    </div>
  `,
})
export class AppModalComponent {
  @Input() title = "Dialog";
  @Input() eyebrow = "";
  @Input() titleId = "appModalTitle";
  @Input() panelClass = "";
  @Input() closeText = "Close";
  @Input() closeLabel = "Close dialog";
  @Input() showFooter = true;
  @Output() closed = new EventEmitter<void>();
}
