import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../services/auth.service";

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
          <label>Role</label>
          <select [(ngModel)]="roleName" name="roleName">
            <option value="">Select role</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="FACILITIES_MANAGER">Facilities Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <small class="help-text">Your role controls the system features available after login.</small>
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
  roleName = "EMPLOYEE";
  message = "";
  isError = false;
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
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
        roleName: this.roleName,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/dashboard"]);
        },
        error: () => {
          this.loading = false;
          this.message =
            "Registration failed. The email may already exist or required fields are missing.";
          this.isError = true;
        },
      });
  }
}
