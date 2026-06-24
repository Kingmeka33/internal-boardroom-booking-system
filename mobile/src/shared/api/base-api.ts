import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@app/store";
import { env } from "@shared/config/env";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      headers.set("content-type", "application/json");
      return headers;
    }
  }),
  tagTypes: ["Auth", "User", "Dashboard", "Boardroom", "Booking", "Notification"],
  endpoints: () => ({})
});
