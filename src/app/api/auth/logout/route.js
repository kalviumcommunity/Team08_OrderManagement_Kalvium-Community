import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Logs out the user by clearing the authentication and refresh token cookies.
 */
export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  // Clear access token cookie by expiring it immediately (maxAge: 0)
  response.cookies.set({
    name: "token",
    value: "",
    maxAge: 0,
    path: "/",
  });

  // Clear refresh token cookie
  response.cookies.set({
    name: "refreshToken",
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
