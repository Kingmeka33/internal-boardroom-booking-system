import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, AuthUser } from "./types";

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isHydrating: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isHydrating: true
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateSession(state, action: PayloadAction<AuthSession | null>) {
      state.accessToken = action.payload?.accessToken ?? null;
      state.refreshToken = action.payload?.refreshToken ?? null;
      state.user = action.payload?.user ?? null;
      state.isHydrating = false;
    },
    setCredentials(state, action: PayloadAction<AuthSession>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isHydrating = false;
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isHydrating = false;
    }
  }
});

export const { hydrateSession, logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
