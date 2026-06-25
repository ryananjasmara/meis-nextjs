import { NextRequest, NextResponse } from "next/server";

/**
 * Route Handlers (unlike Server Components) are allowed to mutate cookies,
 * so this is where we clear a stale/invalid session before sending the user
 * back to login. See apiFetch in lib/api.ts for where this gets triggered.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("meis_token");
  response.cookies.delete("meis_user");
  return response;
}
