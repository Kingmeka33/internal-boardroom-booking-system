import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@shared/api/base-api";
import authReducer from "@features/auth/auth-slice";
import userReducer from "@features/user/user-slice";
import notificationReducer from "@features/notifications/notification-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    notifications: notificationReducer,
    [baseApi.reducerPath]: baseApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
