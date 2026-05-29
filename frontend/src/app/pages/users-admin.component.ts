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
          <div class="eyebrow">Supervision</div>
          <h1>Users</h1>
          <p class="muted">Manage internal users, activation status and assigned roles.</p>
        </div>
        <button class="btn secondary" type="button" (click)="load()">Refresh</button>
      </div>

      <div class="management-layout">
        <section class="card">
          <h2>Create user</h2>
          <div class="form-grid">
            <div class="field"><label>First name</label><input [(ngModel)]="form.firstName" placeholder="Jane" /></div>
            <div class="field"><label>Last name</label><input [(ngModel)]="form.lastName" placeholder="Mokoena" /></div>
            <div class="field"><label>Email</label><input [(ngModel)]="form.email" placeholder="jane@company.com" /></div>
            <div class="field"><label>Password</label><input type="password" [(ngModel)]="form.password" placeholder="At least 8 characters" /></div>
            <div class="field"><label>Department</label><input [(ngModel)]="form.department" placeholder="Operations" /></div>
            <div class="field"><label>Job title</label><input [(ngModel)]="form.jobTitle" placeholder="Coordinator" /></div>
            <div class="field"><label>Role</label>
              <select [(ngModel)]="form.roleId">
                <option value="">Select role</option>
                <option *ngFor="let role of roles" [value]="role.id">{{ role.name }}</option>
              </select>
            </div>
          </div>
          <button class="btn full-width" type="button" (click)="create()">Create user</button>
          <div *ngIf="message" class="alert" [class.error]="isError" [class.success]="!isError">{{ message }}</div>
        </section>

        <section class="card">
          <h2>System users</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td><strong>{{ user.firstName }} {{ user.lastName }}</strong></td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.department || '-' }}</td>
                  <td>{{ user.role?.name || user.role }}</td>
                  <td><span class="badge" [class.approved]="user.isActive">{{ user.isActive ? 'Active' : 'Inactive' }}</span></td>
                  <td><button class="btn tiny danger" type="button" (click)="deactivate(user.id)">Deactivate</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `,
})
export class UsersAdminComponent {
  users: any[] = [];
  roles: any[] = [];
  message = "";
  isError = false;
  form = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "",
    jobTitle: "",
    roleId: "",
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.users().subscribe({ next: (res: any) => (this.users = Array.isArray(res) ? res : []), error: () => (this.users = []) });
    this.api.roles().subscribe({
      next: (res: any) => {
        this.roles = Array.isArray(res) ? res : [];
        if (!this.form.roleId && this.roles.length > 0) {
          const employeeRole = this.roles.find((role) => role.name === "EMPLOYEE");
          this.form.roleId = employeeRole?.id || this.roles[0].id;
        }
      },
      error: () => (this.roles = []),
    });
  }

  create() {
    this.api.createUser(this.form).subscribe({
      next: () => {
        this.message = "User created.";
        this.isError = false;
        this.form.email = "";
        this.form.password = "";
        this.load();
      },
      error: (err) => this.showError(err?.error?.message || "Could not create user."),
    });
  }

  deactivate(id: string) { this.api.deactivateUser(id).subscribe({ next: () => this.load() }); }

  private showError(message: string) {
    this.message = Array.isArray(message) ? message.join(", ") : message;
    this.isError = true;
  }
}
