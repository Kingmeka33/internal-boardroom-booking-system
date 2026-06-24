import { useState } from "react";
import { toApiError } from "@shared/api/api-error";
import { useForgotPasswordMutation } from "../auth-api";

type ForgotPasswordResult = {
  requestPasswordReset: (email: string) => Promise<boolean>;
  clearError: () => void;
  errorMessage: string | null;
  isLoading: boolean;
};

export function useForgotPassword(): ForgotPasswordResult {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function requestPasswordReset(email: string): Promise<boolean> {
    try {
      setErrorMessage(null);
      await forgotPassword({ email }).unwrap();
      return true;
    } catch (error) {
      setErrorMessage(toApiError(error).message);
      return false;
    }
  }

  return {
    requestPasswordReset,
    clearError: () => setErrorMessage(null),
    errorMessage,
    isLoading
  };
}
