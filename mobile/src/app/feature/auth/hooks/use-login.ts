import { useState } from "react";
import { useAppDispatch } from "@app/hooks";
import { toApiError } from "@shared/api/api-error";
import { saveSession } from "@shared/storage/session-storage";
import { setCredentials } from "../auth-slice";
import { useLoginMutation } from "../auth-api";

type LoginResult = {
  submitLogin: (email: string, password: string) => Promise<void>;
  errorMessage: string | null;
  isLoading: boolean;
};

export function useLogin(): LoginResult {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitLogin(email: string, password: string): Promise<void> {
    try {
      setErrorMessage(null);
      const session = await login({ email, password }).unwrap();
      await saveSession(session);
      dispatch(setCredentials(session));
    } catch (error) {
      setErrorMessage(toApiError(error).message);
    }
  }

  return { submitLogin, errorMessage, isLoading };
}
