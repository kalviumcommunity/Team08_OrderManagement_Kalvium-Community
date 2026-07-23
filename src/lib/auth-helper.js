import { verifyToken } from "./jwt";

export function getUserFromRequest(req) {
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

    if (!token) return null;

    return verifyToken(token);
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}
