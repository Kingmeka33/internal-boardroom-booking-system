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
      <div class="auth-card">
        <div class="brand-row">
          <div class="brand-badge dark">IB</div>
          <div>
            <h1>Sign in</h1>
            <p>Access the internal boardroom booking workspace.</p>
          </div>
        </div>

        <div class="field">
          <label>Email address</label>
          <input [(ngModel)]="email" placeholder="admin@company.com" />
        </div>

        <div class="field">
          <label>Password</label>
          <input
            [(ngModel)]="password"
            type="password"
            placeholder="Enter your password"
          />
        </div>

        <button
          class="btn full"
          type="button"
          (click)="login()"
          [disabled]="loading"
        >
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>

        <div *ngIf="message" class="alert" [class.error]="isError">
          {{ message }}
        </div>

        <div class="auth-footer">
          New employee?
          <a routerLink="/register">Create an account</a>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  email = "";
  password = "";
  message = "";
  isError = false;
  loading = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  login() {
    this.loading = true;
    this.message = "";

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(["/dashboard"]);
      },
      error: () => {
        this.loading = false;
        this.message = "Login failed. Check your email and password.";
        this.isError = true;
      },
    });
  }
}
