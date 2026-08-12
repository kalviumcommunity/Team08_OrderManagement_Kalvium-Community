"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LockKeyhole, ArrowLeft, Eye, EyeOff } from "lucide-react";

/**
 * Inner Component for Password Reset Form
 * Reads query parameter `token` from URL and submits new password.
 */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract reset token from URL query string (?token=...)
  const token = searchParams.get("token");

  // Form states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Handle form submission to validate and persist new password
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side validations
    if (!token) {
      alert("Invalid or missing reset link token");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 2. Call API route to complete password reset
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to reset password");
        return;
      }

      alert("Password reset successfully! Please log in with your new password.");

      // 3. Redirect back to login screen
      router.push("/");
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10">
      {/* Return to Login Navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-8"
      >
        <ArrowLeft size={18} />
        Back to Login
      </Link>

      {/* Lock Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <LockKeyhole size={30} className="text-indigo-600" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Reset Password
        </h1>

        <p className="text-gray-500 mt-3">
          Create a new secure password for your account.
        </p>
      </div>

      {/* Password Reset Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* New Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

/**
 * Reset Password Page Component
 * Wraps ResetPasswordContent with Suspense boundary required for `useSearchParams` in Next.js.
 */
export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading form...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
