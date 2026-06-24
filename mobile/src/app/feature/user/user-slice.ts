import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@features/auth/types";

export type UserState = {
  profile: AuthUser | null;
};

const initialState: UserState = {
  profile: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<AuthUser>) {
      state.profile = action.payload;
    },
    clearUser(state) {
      state.profile = null;
    }
  }
});

export const { clearUser, setUserProfile } = userSlice.actions;
export default userSlice.reducer;

