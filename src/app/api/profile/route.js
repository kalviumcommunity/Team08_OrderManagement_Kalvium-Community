export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";

/**
 * GET /api/profile
 * Retrieves the complete profile record of the currently authenticated user.
 */
export async function GET(req) {
  try {
    // 1. Authenticate user from session token
    const user = getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Query user profile by user ID
    const profile = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile API Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
