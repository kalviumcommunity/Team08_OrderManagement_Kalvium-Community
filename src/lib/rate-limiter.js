const rateLimitMap = new Map();

/**
 * Basic in-memory rate limiter.
 * 
 * @param {string} key - Unique key per client (e.g., IP address or email)
 * @param {number} limit - Maximum number of requests allowed in the window
 * @param {number} windowMs - Window duration in milliseconds (default: 1 minute)
 * @returns {boolean} - True if rate limited, false otherwise
 */
export function isRateLimited(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const clientData = rateLimitMap.get(key) || { requests: [] };

  // Filter out requests older than the sliding window
  clientData.requests = clientData.requests.filter((timestamp) => timestamp > now - windowMs);

  if (clientData.requests.length >= limit) {
    return true;
  }

  clientData.requests.push(now);
  rateLimitMap.set(key, clientData);
  return false;
}
export function getClientKey(req, customPrefix = "") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  return `${customPrefix}:${ip}`;
}
