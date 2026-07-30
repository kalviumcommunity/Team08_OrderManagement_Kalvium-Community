import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    let refreshToken = null;

    // Read refresh token from cookies
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("="))
    );
    refreshToken = cookies["refreshToken"];

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token missing" }, { status: 401 });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Verify against DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ error: "Token revoked or user not found" }, { status: 401 });
    }

    // Generate new pair
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

    // Update database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    const response = NextResponse.json({
      message: "Token refreshed successfully",
      token: newAccessToken,
    });

    const isProd = process.env.NODE_ENV === "production";

    // Set updated cookies
    response.cookies.set({
      name: "token",
      value: newAccessToken,
      httpOnly: true,
      secure: isProd,
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
