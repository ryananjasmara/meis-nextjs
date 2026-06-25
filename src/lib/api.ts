import "server-only";
import { redirect } from "next/navigation";
import { getToken } from "./session";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Skip attaching the auth token (e.g. login/register). */
  unauthenticated?: boolean;
  cache?: RequestCache;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (!options.unauthenticated) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401 && !options.unauthenticated) {
      // Session token is missing/expired/invalid (e.g. the user it belonged to no longer
      // exists). Route through a handler that can clear the cookie (Server Components,
      // unlike Route Handlers, aren't allowed to mutate cookies) before landing on login.
      redirect("/api/session-expired");
    }

    const message = (data && (data.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(", ") : message, data);
  }

  return data as T;
}
