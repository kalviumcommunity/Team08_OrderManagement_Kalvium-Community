import { NextResponse } from "next/server";

/**
 * Next.js Edge Middleware for API Requests
 * Handles Cross-Origin Resource Sharing (CORS), preflight OPTIONS requests,
 * and attaches standard security/CORS headers to all API responses.
 * 
 * @param {Request} request - Incoming HTTP request
 * @returns {NextResponse} - Modified response with appropriate CORS headers
 */
export function middleware(request) {
  // Extract requesting origin or fallback to allow all
  const origin = request.headers.get("origin") || "*";

  // 1. Handle preflight CORS OPTIONS request
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept"
    );
    response.headers.set("Access-Control-Max-Age", "86400"); // Cache preflight response for 24 hours
    return response;
  }

  // 2. Handle regular API requests - pass through and append CORS headers
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );

  return response;
}

/**
 * Middleware Matcher Configuration
 * Specifies that this middleware executes only for routes under `/api/*`.
 */
export const config = {
  matcher: "/api/:path*",
};
