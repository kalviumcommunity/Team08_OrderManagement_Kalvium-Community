"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Apple } from "lucide-react";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(form);

    // TODO:
    // Call Login API
    // Redirect to dashboard
  };

  return (
    <div className="w-full">

      {/* Heading */}

      <div className="text-center">

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Welcome Back.
        </h1>

        <p className="mt-3 text-gray-500 text-sm sm:text-base leading-6">
          Please enter your operational credentials to access
          your dashboard.
        </p>

      </div>

      {/* Social Buttons */}

      <div className="grid grid-cols-2 gap-4 mt-8">

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium hover:bg-gray-100 transition"
        >
          <span className="text-lg font-bold">G</span>

          Google

        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium hover:bg-gray-100 transition"
        >
          <Apple size={20} />

          Apple

        </button>

      </div>

      {/* Divider */}

      <div className="flex items-center my-8">

        <div className="flex-1 border-t"></div>

        <span className="px-4 text-xs font-semibold tracking-[4px] text-gray-400">
          OR CONTINUE WITH EMAIL
        </span>

        <div className="flex-1 border-t"></div>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Email */}

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
              placeholder="restaurant@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />

          </div>

        </div>

        {/* Password */}

        <PasswordInput
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />

        {/* Remember */}

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

        {/* Button */}

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 transition py-3 text-white font-semibold text-lg"
        >
          Sign In
        </button>

      </form>

      {/* Bottom */}

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