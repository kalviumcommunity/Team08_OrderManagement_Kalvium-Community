import { verifyToken } from "./jwt";
import { getToken } from "next-auth/jwt";

export async function getUserFromRequest(req) {
  try {
    let token = null;

    // 1. Check Authorization Header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Check Cookie
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => c.trim().split("="))
      );
      token = cookies["token"];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded) return decoded;
      } catch (err) {
        // Custom token verification failed or expired, fallback to NextAuth session
      }
    }

    // 3. Fallback to NextAuth Session Token
    const nextAuthSecret = process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_purposes_only";
    const nextAuthToken = await getToken({ req, secret: nextAuthSecret });
    if (nextAuthToken) {
      return {
        id: nextAuthToken.id,
        email: nextAuthToken.email,
        name: nextAuthToken.name,
        role: nextAuthToken.role,
      };
    }

    return null;
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}

