import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "./services/auth.service";

interface NavItem {
  label: string;
  route: string;
  roles: string[];
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-container *ngIf="isAuthPage(); else protectedShell">
      <router-outlet />
    </ng-container>

    <ng-template #protectedShell>
      <div class="app-shell">
        <aside class="sidebar">
          <div class="brand">
            <div class="brand-badge">IB</div>
            <div class="brand-title">Internal Boardroom Booking</div>
            <div class="brand-subtitle">Rooms, approvals and utilisation</div>
          </div>

          <nav>
            <a
              *ngFor="let item of visibleNavItems()"
              class="nav-link"
              [routerLink]="item.route"
              routerLinkActive="active"
            >
              {{ item.label }}
            </a>
          </nav>
        </aside>

        <section class="main">
          <header class="topbar">
            <div>
              <strong>Workspace</strong>
              <div class="muted small" *ngIf="auth.getUser() as user">
                Signed in as {{ user.firstName }} {{ user.lastName }} · {{ user.role }}
              </div>
            </div>
            <button class="ghost-btn" type="button" (click)="auth.logout()">Logout</button>
          </header>

          <router-outlet />
        </section>
      </div>
    </ng-template>
  `,
})
export class AppComponent {
  readonly navItems: NavItem[] = [
    { label: "Dashboard", route: "/dashboard", roles: ["ALL"] },
    { label: "Boardrooms", route: "/boardrooms", roles: ["ALL"] },
    { label: "Create Booking", route: "/book", roles: ["ALL"] },
    { label: "My Bookings", route: "/my-bookings", roles: ["ALL"] },
    { label: "Calendar", route: "/calendar", roles: ["ALL"] },
    {
      label: "All Bookings",
      route: "/admin/bookings",
      roles: ["ADMIN", "SUPER_ADMIN", "FACILITIES_MANAGER"],
    },
    {
      label: "Boardroom Admin",
      route: "/admin/boardrooms",
      roles: ["ADMIN", "SUPER_ADMIN"],
    },
    { label: "Amenities", route: "/admin/amenities", roles: ["ADMIN", "SUPER_ADMIN"] },
    {
      label: "Room Blocks",
      route: "/room-blocks",
      roles: ["ADMIN", "SUPER_ADMIN", "FACILITIES_MANAGER"],
    },
    { label: "Notifications", route: "/notifications", roles: ["ALL"] },
    { label: "Users", route: "/admin/users", roles: ["ADMIN", "SUPER_ADMIN"] },
    { label: "Audit Logs", route: "/audit-logs", roles: ["ADMIN", "SUPER_ADMIN"] },
    { label: "Settings", route: "/settings", roles: ["ADMIN", "SUPER_ADMIN"] },
  ];

  constructor(
    public readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  isAuthPage(): boolean {
    return this.router.url.startsWith("/login") || this.router.url.startsWith("/register");
  }

  visibleNavItems(): NavItem[] {
    const role = this.auth.getUser()?.role || "";
    return this.navItems.filter((item) => item.roles.includes("ALL") || item.roles.includes(role));
  }
}
