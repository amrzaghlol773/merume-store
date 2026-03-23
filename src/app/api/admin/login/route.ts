import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionToken,
  isValidAdminCredentials,
} from "@/lib/server/admin-auth";
import {
  getLoginThrottleState,
  registerFailedLoginAttempt,
  resetLoginAttempts,
} from "@/lib/server/login-rate-limit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() || "";
    const password = body.password?.trim() || "";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")?.trim()
      || "unknown";
    const throttleKey = `${ip}:${username || "anonymous"}`;

    const throttleState = getLoginThrottleState(throttleKey);
    if (throttleState.blocked) {
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${throttleState.retryAfterSeconds} seconds.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(throttleState.retryAfterSeconds),
          },
        },
      );
    }

    if (!isValidAdminCredentials(username, password)) {
      registerFailedLoginAttempt(throttleKey);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    resetLoginAttempts(throttleKey);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, getAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/login failed", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
