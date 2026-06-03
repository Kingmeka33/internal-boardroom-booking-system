import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { ToastService } from "../services/toast.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-card wide">
        <div class="brand-row">
          <div class="brand-badge dark">IB</div>
          <div>
            <h1>Create account</h1>
            <p>
              Register as an employee to request and manage boardroom bookings.
            </p>
          </div>
        </div>

        <div class="form-grid two">
          <div class="field">
            <label>First name</label>
            <input [(ngModel)]="firstName" placeholder="Jane" />
          </div>

          <div class="field">
            <label>Last name</label>
            <input [(ngModel)]="lastName" placeholder="Mokoena" />
          </div>
        </div>

        <div class="field">
          <label>Email address</label>
          <input [(ngModel)]="email" placeholder="jane@company.com" />
        </div>

        <div class="form-grid two">
          <div class="field">
            <label>Department</label>
            <input [(ngModel)]="department" placeholder="Operations" />
          </div>

          <div class="field">
            <label>Job title</label>
            <input [(ngModel)]="jobTitle" placeholder="Coordinator" />
          </div>
        </div>

        <div class="field">
          <label>Password</label>
          <input
            [(ngModel)]="password"
            type="password"
            placeholder="Create a password"
          />
        </div>

        <button
          class="btn full"
          type="button"
          (click)="register()"
          [disabled]="loading"
        >
          {{ loading ? "Creating account..." : "Create account" }}
        </button>

        <div *ngIf="message" class="alert" [class.error]="isError">
          {{ message }}
        </div>

        <div class="auth-footer">
          Already have an account?
          <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  firstName = "";
  lastName = "";
  email = "";
  department = "";
  jobTitle = "";
  password = "";
  message = "";
  isError = false;
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: ToastService,
  ) {}

  register() {
    this.loading = true;
    this.message = "";

    this.auth
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        department: this.department,
        jobTitle: this.jobTitle,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast.success("Employee account created successfully.");
          this.router.navigate(["/dashboard"]);
        },
        error: (err) => {
          this.loading = false;
          this.message = this.errorMessage(err, "Registration failed.");
          this.isError = true;
          this.toast.error(this.message);
        },
      });
  }

  private errorMessage(err: any, fallback: string): string {
    const message = err?.error?.message || fallback;
    return Array.isArray(message) ? message.join(", ") : message;
  }
}
