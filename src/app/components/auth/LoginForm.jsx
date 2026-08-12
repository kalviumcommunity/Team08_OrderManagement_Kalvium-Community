"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import PasswordInput from "./PasswordInput";

/**
 * LoginForm Component
 * Handles client-side authentication submission, validation,
 * error notification, local storage caching, and redirect to the dashboard.
 */
export default function LoginForm() {
  const router = useRouter();

  // Controlled form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");

  // Check if both fields are non-empty
  const isFormValid =
    form.email.trim() !== "" &&
    form.password.trim() !== "";

  // Universal change handler for text inputs and checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Submit credentials to /api/auth/login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store non-sensitive user summary in localStorage for easy UI rendering
      localStorage.setItem("user", JSON.stringify(data.user));

      // Navigate to operations dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full">
      {/* Title & Subheading */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Welcome Back.
        </h1>

        <p className="mt-3 text-gray-500 text-sm sm:text-base leading-6">
          Please enter your operational credentials to access
          your dashboard.
        </p>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700 text-sm mt-4">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        {/* Email Address Field */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Work Email
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              name="email"
              required
              placeholder="restaurant@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Password Input with Visibility Toggle */}
        <PasswordInput
          label="Password"
          name="password"
          required={true}
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />

        {/* Remember Device & Forgot Password Links */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <label className="flex items-center gap-2 text-gray-600 text-sm">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            Remember this device
          </label>

          <Link
            href="/forgot-password"
            className="text-indigo-600 font-medium hover:underline text-sm"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full rounded-xl py-3 text-white font-semibold text-lg transition ${
            isFormValid
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Sign In
        </button>
      </form>

      {/* Redirect to Registration */}
      <div className="mt-8 text-center text-gray-600 text-sm sm:text-base">
        Don&apos;t have an account?
        <Link
          href="/signup"
          className="ml-2 font-semibold text-indigo-600 hover:underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}