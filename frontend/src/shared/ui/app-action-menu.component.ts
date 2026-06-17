import { CommonModule } from "@angular/common";
import { Component, HostListener, Input } from "@angular/core";

export type AppActionMenuIcon = "edit" | "delete" | "reactivate" | "approve" | "cancel";

export interface AppActionMenuItem {
  label: string;
  icon: AppActionMenuIcon;
  danger?: boolean;
  disabled?: boolean;
  action: () => void;
}

@Component({
  standalone: true,
  selector: "app-action-menu",
  imports: [CommonModule],
  template: `
    <div class="row-action-menu" (click)="$event.stopPropagation()">
      <button
        class="kebab-btn"
        type="button"
        aria-label="Open row actions"
        [attr.aria-expanded]="open"
        (click)="open = !open"
      >
        <span aria-hidden="true">⋮</span>
      </button>

      <div *ngIf="open" class="row-action-popover" role="menu">
        <button
          *ngFor="let item of items"
          class="row-action-item"
          [class.danger]="item.danger"
          type="button"
          role="menuitem"
          [disabled]="item.disabled"
          (click)="run(item)"
        >
          <span class="row-action-icon" aria-hidden="true" [ngSwitch]="item.icon">
            <svg *ngSwitchCase="'edit'" viewBox="0 0 24 24"><path d="M4 17.2V20h2.8L17.7 9.1l-2.8-2.8L4 17.2Zm15.8-10.3c.3-.3.3-.8 0-1.1l-1.6-1.6c-.3-.3-.8-.3-1.1 0l-1.3 1.3 2.8 2.8 1.2-1.4Z" /></svg>
            <svg *ngSwitchCase="'delete'" viewBox="0 0 24 24"><path d="M7 21c-1.1 0-2-.9-2-2V7h14v12c0 1.1-.9 2-2 2H7ZM9 4h6l1 1h4v2H4V5h4l1-1Z" /></svg>
            <svg *ngSwitchCase="'reactivate'" viewBox="0 0 24 24"><path d="M12 5a7 7 0 1 1-6.3 4H3l4-4 4 4H8a5 5 0 1 0 4-2V5Z" /></svg>
            <svg *ngSwitchCase="'approve'" viewBox="0 0 24 24"><path d="m9 16.2-3.5-3.5L4 14.2 9 19 20 8l-1.5-1.5L9 16.2Z" /></svg>
            <svg *ngSwitchDefault viewBox="0 0 24 24"><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6 6.4 5Z" /></svg>
          </span>
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  `,
})
export class AppActionMenuComponent {
  @Input() items: AppActionMenuItem[] = [];
  open = false;

  @HostListener("document:click")
  closeFromOutside(): void {
    this.open = false;
  }

  run(item: AppActionMenuItem): void {
    if (item.disabled) return;
    this.open = false;
    item.action();
  }
}
