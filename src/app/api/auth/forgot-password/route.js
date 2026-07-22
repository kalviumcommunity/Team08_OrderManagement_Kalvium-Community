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

    // Generate a mock reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour expiration

    // Since we don't have reset token fields on our basic User model, we'll return
    // the mock token in response for simulation, or write it to logs/console.
    console.log(`[Forgot Password] Reset token for ${email}: ${resetToken} (expires at ${expires})`);

    return NextResponse.json(
      {
        message: "If that email exists, we have sent a password reset token.",
        // We expose the token in the API for testing and mock interface purposes
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
