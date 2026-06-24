import { baseApi } from "@shared/api/base-api";
import { unwrapApiResponse } from "@shared/api/api-response";
import type {
  AuthSession,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest
} from "./types";

type MessageResponse = {
  message: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body
      }),
      transformResponse: unwrapApiResponse<AuthSession>,
      invalidatesTags: ["Auth", "User"]
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body
      }),
      transformResponse: unwrapApiResponse<MessageResponse>
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body
      }),
      transformResponse: unwrapApiResponse<MessageResponse>
    })
  })
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} = authApi;
