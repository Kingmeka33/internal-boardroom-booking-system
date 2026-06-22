import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
  selector: "app-form-actions",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="form-actions"><ng-content /></div>`,
})
export class AppFormActionsComponent {}
