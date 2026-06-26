"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { clearSession, setSession } from "@/lib/session";
import type { User } from "@/lib/types";

export type LoginState = { error?: string; email?: string; success?: boolean } | undefined;

type LoginResponse = { accessToken: string; user: User };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required.", email };
  }

  try {
    const { accessToken, user } = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      unauthenticated: true,
    });
    await setSession(accessToken, user);
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message || "Invalid credentials." : "Could not reach the server. Please try again.";
    return { error: message, email };
  }

  return { success: true };
}

export async function logoutAction() {
  await clearSession();
}
