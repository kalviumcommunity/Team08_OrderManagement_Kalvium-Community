import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validation";

/**
 * POST /api/auth/register
 * Handles registration for new users/restaurant owners.
 * Validates the schema, hashes password, prevents duplicate emails, and creates DB record.
 */
export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Validate payload against Zod schema
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error.issues
            .map((e) => e.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const {
      name,
      restaurantName,
      phone,
      businessType,
      email,
      password,
      role,
    } = validation.data;

    // 2. Check if user with given email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Default role to OWNER if not specified
    const finalRole = role || "OWNER";

    // 3. Hash password securely with salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create new user record in SQLite / Postgres via Prisma
    const user = await prisma.user.create({
      data: {
        name,
        restaurantName,
        phone,
        businessType,
        email,
        passwordHash: hashedPassword,
        role: finalRole,
      },
    });

    // 5. Exclude passwordHash before returning created user data
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
