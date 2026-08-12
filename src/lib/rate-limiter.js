/**
 * In-Memory Sliding Window Rate Limiter
 * Tracks timestamps of recent requests per key (e.g. IP address or email) to prevent API abuse.
 */
const rateLimitMap = new Map();

/**
 * Basic in-memory rate limiter using a sliding window algorithm.
 * 
 * @param {string} key - Unique identifier per client (e.g., "auth:127.0.0.1" or user email)
 * @param {number} limit - Maximum number of requests allowed within the window (default: 10)
 * @param {number} windowMs - Sliding window duration in milliseconds (default: 60000ms = 1 minute)
 * @returns {boolean} - Returns true if the client exceeded the rate limit, false otherwise
 */
export function isRateLimited(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const clientData = rateLimitMap.get(key) || { requests: [] };

  // Filter out request timestamps older than the sliding window threshold
  clientData.requests = clientData.requests.filter((timestamp) => timestamp > now - windowMs);

  // Check if current requests in window exceed the threshold
  if (clientData.requests.length >= limit) {
    return true; // Limit exceeded
  }

  // Record current request timestamp and save back to map
  clientData.requests.push(now);
  rateLimitMap.set(key, clientData);
  return false; // Request allowed
}

/**
 * Generates a unique client key based on client IP from the request headers.
 * 
 * @param {Request} req - The incoming Next.js request
 * @param {string} customPrefix - Optional namespace prefix for categorizing rate limits (e.g., 'login')
 * @returns {string} - Combined rate limit key (e.g., "login:192.168.1.1")
 */
export function getClientKey(req, customPrefix = "") {
  // Extract client IP address from x-forwarded-for header or fallback to localhost
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  return `${customPrefix}:${ip}`;
}
