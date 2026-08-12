import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * POST /api/auth/reset-password
 * Completes the password reset process.
 * Verifies the provided reset token hash and expiration, then hashes and saves the new password.
 */
export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    // 1. Validate inputs
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 2. Hash token to compare with database record
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 3. Find matching user with unexpired token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(), // Check expiration > current date
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // 4. Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 5. Update user password and invalidate reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
