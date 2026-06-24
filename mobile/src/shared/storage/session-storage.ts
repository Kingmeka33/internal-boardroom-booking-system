import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "@features/auth/types";

const sessionKey = "internal-boardroom-booking-session";

export async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(sessionKey, JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  const value = await SecureStore.getItemAsync(sessionKey);
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(sessionKey);
}
