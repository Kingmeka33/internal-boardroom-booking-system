import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, tap } from "rxjs";
import { ApiService } from "./api.service";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly accessTokenKey = "accessToken";
  private readonly refreshTokenKey = "refreshToken";
  private readonly userKey = "authUser";

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(
    this.getStoredUser(),
  );
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
  ) {}

  login(payload: { email: string; password: string }) {
    return this.api
      .login(payload)
      .pipe(tap((response: any) => this.storeSession(response)));
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
    return this.api
      .register(payload)
      .pipe(tap((response: any) => this.storeSession(response)));
  }

  logout() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
    this.router.navigate(["/login"]);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getUser(): AuthUser | null {
    return this.userSubject.value;
  }

  private storeSession(response: AuthResponse) {
    localStorage.setItem(this.accessTokenKey, response.accessToken);
    localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private getStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
