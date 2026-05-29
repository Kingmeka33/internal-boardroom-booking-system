import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  private paramsFrom(filters: Record<string, string | number | boolean | undefined>) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params = params.set(key, String(value));
    });
    return params;
  }

  login(payload: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/auth/login`, payload);
  }

  register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
    roleName?: string;
  }) {
    return this.http.post(`${this.baseUrl}/auth/register`, payload);
  }

  dashboard() {
    return this.http.get(`${this.baseUrl}/dashboard/summary`);
  }

  roomUtilisation() {
    return this.http.get(`${this.baseUrl}/dashboard/room-utilisation`);
  }

  bookingsByStatus() {
    return this.http.get(`${this.baseUrl}/dashboard/bookings-by-status`);
  }

  bookingsByDepartment() {
    return this.http.get(`${this.baseUrl}/dashboard/bookings-by-department`);
  }

  peakHours() {
    return this.http.get(`${this.baseUrl}/dashboard/peak-hours`);
  }

  boardrooms() {
    return this.http.get(`${this.baseUrl}/boardrooms`);
  }

  getBoardroom(id: string) {
    return this.http.get(`${this.baseUrl}/boardrooms/${id}`);
  }

  createBoardroom(payload: unknown) {
    return this.http.post(`${this.baseUrl}/boardrooms`, payload);
  }

  updateBoardroom(id: string, payload: unknown) {
    return this.http.patch(`${this.baseUrl}/boardrooms/${id}`, payload);
  }

  deactivateBoardroom(id: string) {
    return this.http.patch(`${this.baseUrl}/boardrooms/${id}/status`, {});
  }

  assignBoardroomAmenities(id: string, amenityIds: string[]) {
    return this.http.post(`${this.baseUrl}/boardrooms/${id}/amenities`, { amenityIds });
  }

  availableBoardrooms(filters: Record<string, string | number | boolean | undefined>) {
    return this.http.get(`${this.baseUrl}/boardrooms/available`, {
      params: this.paramsFrom(filters),
    });
  }

  createBooking(payload: unknown) {
    return this.http.post(`${this.baseUrl}/bookings`, payload);
  }

  updateBooking(id: string, payload: unknown) {
    return this.http.patch(`${this.baseUrl}/bookings/${id}`, payload);
  }

  myBookings() {
    return this.http.get(`${this.baseUrl}/bookings/my-bookings`);
  }

  allBookings(filters: Record<string, string | number | boolean | undefined> = {}) {
    return this.http.get(`${this.baseUrl}/bookings`, {
      params: this.paramsFrom(filters),
    });
  }

  calendar(filters: Record<string, string | number | boolean | undefined> = {}) {
    return this.http.get(`${this.baseUrl}/bookings/calendar`, {
      params: this.paramsFrom(filters),
    });
  }

  approveBooking(id: string) {
    return this.http.patch(`${this.baseUrl}/bookings/${id}/approve`, {});
  }

  rejectBooking(id: string, reason: string) {
    return this.http.patch(`${this.baseUrl}/bookings/${id}/reject`, { reason });
  }

  cancelBooking(id: string, reason: string) {
    return this.http.patch(`${this.baseUrl}/bookings/${id}/cancel`, { reason });
  }

  completeBooking(id: string) {
    return this.http.patch(`${this.baseUrl}/bookings/${id}/complete`, {});
  }

  noShowBooking(id: string) {
    return this.http.patch(`${this.baseUrl}/bookings/${id}/no-show`, {});
  }

  amenities() {
    return this.http.get(`${this.baseUrl}/amenities`);
  }

  createAmenity(payload: unknown) {
    return this.http.post(`${this.baseUrl}/amenities`, payload);
  }

  updateAmenity(id: string, payload: unknown) {
    return this.http.patch(`${this.baseUrl}/amenities/${id}`, payload);
  }

  deactivateAmenity(id: string) {
    return this.http.delete(`${this.baseUrl}/amenities/${id}`);
  }

  roomBlocks() {
    return this.http.get(`${this.baseUrl}/boardroom-blocks`);
  }

  createRoomBlock(payload: unknown) {
    return this.http.post(`${this.baseUrl}/boardroom-blocks`, payload);
  }

  updateRoomBlock(id: string, payload: unknown) {
    return this.http.patch(`${this.baseUrl}/boardroom-blocks/${id}`, payload);
  }

  deactivateRoomBlock(id: string) {
    return this.http.delete(`${this.baseUrl}/boardroom-blocks/${id}`);
  }

  notifications() {
    return this.http.get(`${this.baseUrl}/notifications`);
  }

  unreadNotificationCount() {
    return this.http.get(`${this.baseUrl}/notifications/unread-count`);
  }

  markNotificationRead(id: string) {
    return this.http.patch(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead() {
    return this.http.patch(`${this.baseUrl}/notifications/mark-all-read`, {});
  }

  auditLogs(filters: Record<string, string | number | boolean | undefined> = {}) {
    return this.http.get(`${this.baseUrl}/audit-logs`, {
      params: this.paramsFrom(filters),
    });
  }

  systemSettings() {
    return this.http.get(`${this.baseUrl}/system-settings`);
  }

  updateSystemSetting(key: string, value: string) {
    return this.http.patch(`${this.baseUrl}/system-settings/${key}`, { value });
  }

  roles() {
    return this.http.get(`${this.baseUrl}/roles`);
  }

  users() {
    return this.http.get(`${this.baseUrl}/users`);
  }

  createUser(payload: unknown) {
    return this.http.post(`${this.baseUrl}/users`, payload);
  }

  deactivateUser(id: string) {
    return this.http.patch(`${this.baseUrl}/users/${id}/status`, {});
  }
}
