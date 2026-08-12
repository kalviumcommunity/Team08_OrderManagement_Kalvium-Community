import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/jwt";

/**
 * POST /api/auth/refresh
 * Validates the existing refresh token cookie, ensures it matches database record,
 * generates a fresh pair of access & refresh tokens, updates DB, and resets cookies.
 */
export async function POST(req) {
  try {
    let refreshToken = null;

    // 1. Read refresh token from incoming HTTP cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("="))
    );
    refreshToken = cookies["refreshToken"];

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token missing" }, { status: 401 });
    }

    // 2. Cryptographically verify refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    // 3. Verify user exists and token has not been revoked/overwritten
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ error: "Token revoked or user not found" }, { status: 401 });
    }

    // 4. Generate new pair of tokens (Token Rotation)
    const newAccessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Persist the rotated refresh token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // 6. Build response
    const response = NextResponse.json({
      message: "Token refreshed successfully",
      token: newAccessToken,
    });

    const isProd = process.env.NODE_ENV === "production";

    // 7. Update cookies with new access and refresh tokens
    response.cookies.set({
      name: "token",
      value: newAccessToken,
      httpOnly: true,
      secure: isProd,
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
