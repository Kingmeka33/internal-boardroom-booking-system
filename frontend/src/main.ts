import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, Routes } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { AdminBookingsComponent } from "./app/pages/admin-bookings.component";
import { AmenitiesAdminComponent } from "./app/pages/amenities-admin.component";
import { AuditLogsComponent } from "./app/pages/audit-logs.component";
import { BoardroomAdminComponent } from "./app/pages/boardroom-admin.component";
import { BoardroomsComponent } from "./app/pages/boardrooms.component";
import { BookingCalendarComponent } from "./app/pages/booking-calendar.component";
import { BookingFormComponent } from "./app/pages/booking-form.component";
import { DashboardComponent } from "./app/pages/dashboard.component";
import { LoginComponent } from "./app/pages/login.component";
import { MyBookingsComponent } from "./app/pages/my-bookings.component";
import { NotificationsComponent } from "./app/pages/notifications.component";
import { RegisterComponent } from "./app/pages/register.component";
import { RoomBlocksComponent } from "./app/pages/room-blocks.component";
import { SettingsComponent } from "./app/pages/settings.component";
import { UsersAdminComponent } from "./app/pages/users-admin.component";
import { authGuard, guestGuard } from "./app/services/auth.guard";
import { authInterceptor } from "./app/services/auth.interceptor";

const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "register", component: RegisterComponent, canActivate: [guestGuard] },
  { path: "dashboard", component: DashboardComponent, canActivate: [authGuard] },
  { path: "boardrooms", component: BoardroomsComponent, canActivate: [authGuard] },
  { path: "book", component: BookingFormComponent, canActivate: [authGuard] },
  { path: "my-bookings", component: MyBookingsComponent, canActivate: [authGuard] },
  { path: "calendar", component: BookingCalendarComponent, canActivate: [authGuard] },
  { path: "admin/bookings", component: AdminBookingsComponent, canActivate: [authGuard] },
  { path: "admin/boardrooms", component: BoardroomAdminComponent, canActivate: [authGuard] },
  { path: "admin/amenities", component: AmenitiesAdminComponent, canActivate: [authGuard] },
  { path: "admin/users", component: UsersAdminComponent, canActivate: [authGuard] },
  { path: "room-blocks", component: RoomBlocksComponent, canActivate: [authGuard] },
  { path: "notifications", component: NotificationsComponent, canActivate: [authGuard] },
  { path: "audit-logs", component: AuditLogsComponent, canActivate: [authGuard] },
  { path: "settings", component: SettingsComponent, canActivate: [authGuard] },
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "**", redirectTo: "login" },
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor]))],
});
