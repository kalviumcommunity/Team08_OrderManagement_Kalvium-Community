import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

/**
 * POST /api/auth/forgot-password
 * Handles password reset requests.
 * Generates a secure random reset token, stores its hash and expiry in the database,
 * and sends an email containing the reset link via nodemailer.
 */
export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // 1. Look up user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Prevent user enumeration: always return 200 even if user doesn't exist
    if (!user) {
      return NextResponse.json(
        { message: "If that email exists, we have sent a password reset token." },
        { status: 200 }
      );
    }

    // 3. Generate a secure random token and compute SHA-256 hash for storage
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour expiry (in ms)

    // 4. Update user record with hashed reset token and expiration time
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expires,
      },
    });

    // 5. Construct password reset URL with unhashed token
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // 6. Configure email transporter (SMTP Gmail)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 7. Dispatch the reset email with HTML template
    await transporter.sendMail({
      from: `"Licious" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Licious password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Licious account.</p>
          <p>This link will expire in 1 hour.</p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              margin-top: 16px;
              padding: 12px 20px;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top: 20px;">
            If you did not request this password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message: "If that email exists, we have sent a password reset token.",
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
