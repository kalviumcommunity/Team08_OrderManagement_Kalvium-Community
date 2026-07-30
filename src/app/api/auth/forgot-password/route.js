import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return 200/success anyway to prevent user enumeration security issues
      return NextResponse.json(
        { message: "If that email exists, we have sent a password reset token." },
        { status: 200 }
      );
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour expiration

    // Update user in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      },
    });

    console.log(`[Forgot Password] Simulated Email Sent to ${email} with token: ${resetToken}`);

    return NextResponse.json(
      {
        message: "If that email exists, we have sent a password reset token.",
        debug: {
          resetToken,
          expires,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
