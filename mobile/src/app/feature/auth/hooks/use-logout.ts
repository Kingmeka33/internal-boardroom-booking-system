import { useAppDispatch } from "@app/hooks";
import { clearSession } from "@shared/storage/session-storage";
import { baseApi } from "@shared/api/base-api";
import { logout } from "../auth-slice";
import { clearUser } from "@features/user/user-slice";

export function useLogout() {
  const dispatch = useAppDispatch();

  async function submitLogout(): Promise<void> {
    await clearSession();
    dispatch(logout());
    dispatch(clearUser());
    dispatch(baseApi.util.resetApiState());
  }

  return { submitLogout };
}
