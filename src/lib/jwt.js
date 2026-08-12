import jwt from "jsonwebtoken";

/**
 * JWT Configuration and Secret Key
 * Retrieves the secret key from environment variables or uses a secure default for fallback.
 */
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-jwt-secret-key-123456";

/**
 * Sign a short-lived access token for authenticating API requests.
 * @param {object} payload - The user data payload to encode (e.g., id, email, role)
 * @returns {string} - Signed JWT string with 15-minute expiration
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

/**
 * Sign a long-lived refresh token for issuing new access tokens without re-login.
 * @param {object} payload - The user data payload to encode
 * @returns {string} - Signed JWT string with 7-day expiration
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Legacy wrapper function for signing tokens (kept for backward compatibility).
 * @param {object} payload - User data payload
 * @returns {string} - Signed JWT access token
 */
export function signToken(payload) {
  return signAccessToken(payload);
}

/**
 * Verify and decode a JWT token string using the secret key.
 * @param {string} token - The raw JWT token string
 * @returns {object|null} - Decoded payload if valid, null if invalid or expired
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; // Return null gracefully on signature mismatch or expiration
  }
}
