import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  level: "success" | "error" | "info";
};

export type NotificationState = {
  items: AppNotification[];
};

const initialState: NotificationState = {
  items: []
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    pushNotification(state, action: PayloadAction<AppNotification>) {
      state.items.unshift(action.payload);
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    }
  }
});

export const {
  clearNotifications,
  pushNotification,
  removeNotification
} = notificationSlice.actions;
export default notificationSlice.reducer;
