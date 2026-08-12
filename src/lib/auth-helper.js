import { verifyToken } from "./jwt";

/**
 * Extracts and verifies the authenticated user from an incoming Next.js Request object.
 * Checks both the `Authorization: Bearer <token>` header and HTTP cookie `token`.
 * 
 * @param {Request} req - The incoming Next.js request object
 * @returns {object|null} - Decoded user payload if authenticated, or null if unauthenticated/invalid
 */
export function getUserFromRequest(req) {
  try {
    let token = null;

    // 1. Attempt to extract token from Authorization header (Bearer scheme)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. If not found in headers, check cookie header
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const cookies = Object.fromEntries(
        cookieHeader
          .split(";")
          .map((c) => c.trim().split("="))
      );
      token = cookies["token"];
    }

    // Return null if no token was found in either header or cookies
    if (!token) return null;

    // 3. Verify and decode token using JWT secret
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}
