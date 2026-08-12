import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { isRateLimited, getClientKey } from "@/lib/rate-limiter";

/**
 * POST /api/auth/login
 * Handles user authentication via email & password.
 * Implements rate limiting, credential verification, JWT token generation,
 * and sets HttpOnly cookies for session management.
 */
export async function POST(req) {
  try {
    // 1. Rate Limiting Check (Max 5 attempts per minute per IP)
    const ipKey = getClientKey(req, "login");
    if (isRateLimited(ipKey, 5, 60000)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    // 2. Parse and validate request body
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 3. Find user by email in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 5. Generate short-lived Access Token (15m) and long-lived Refresh Token (7d)
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 6. Persist refresh token in user database record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
      },
    });

    // 7. Construct JSON response payload
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: accessToken,
    });

    const isProd = process.env.NODE_ENV === "production";

    // 8. Attach secure, HttpOnly cookies for access and refresh tokens
    response.cookies.set({
      name: "token",
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
