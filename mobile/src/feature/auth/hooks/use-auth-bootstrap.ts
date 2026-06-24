import { useEffect } from "react";
import { useAppDispatch } from "@app/hooks";
import { getSession } from "@shared/storage/session-storage";
import { hydrateSession } from "../auth-slice";

export function useAuthBootstrap(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;

    async function restoreSession(): Promise<void> {
      const session = await getSession();
      if (active) dispatch(hydrateSession(session));
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [dispatch]);
}
