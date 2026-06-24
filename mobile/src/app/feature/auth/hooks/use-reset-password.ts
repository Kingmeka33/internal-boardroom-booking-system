import { useState } from "react";
import { toApiError } from "@shared/api/api-error";
import { useResetPasswordMutation } from "../auth-api";

type ResetPasswordResult = {
  submitPasswordReset: (token: string, password: string) => Promise<boolean>;
  clearError: () => void;
  errorMessage: string | null;
  isLoading: boolean;
};

export function useResetPassword(): ResetPasswordResult {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitPasswordReset(
    token: string,
    password: string,
  ): Promise<boolean> {
    try {
      setErrorMessage(null);
      await resetPassword({ token, password }).unwrap();
      return true;
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      return false;
    }
  }

  return {
    submitPasswordReset,
    clearError: () => setErrorMessage(null),
    errorMessage,
    isLoading
  };
}
