"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";

/**
 * SignupForm Component
 * Form for registering new restaurant accounts.
 * Collects owner information, restaurant branding, business type, and credentials.
 * Automatically performs login upon successful account creation.
 */
export default function SignupForm() {
  const router = useRouter();

  // Controlled form state
  const [form, setForm] = useState({
    restaurant: "",
    owner: "",
    email: "",
    phone: "",
    business: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  // Client-side form completeness and password match check
  const isFormValid =
    form.restaurant.trim() !== "" &&
    form.owner.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.business.trim() !== "" &&
    form.password.trim() !== "" &&
    form.confirmPassword.trim() !== "" &&
    form.password === form.confirmPassword &&
    form.agree;

  // Unified input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Submits user registration payload and auto-logs in
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      // 1. Send registration request
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.owner,
          restaurantName: form.restaurant,
          phone: form.phone,
          businessType: form.business,
          email: form.email,
          password: form.password,
          role: "OWNER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      // 2. Automatically log in upon successful registration
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        alert(loginData.error);
        return;
      }

      // Save user session in localStorage and redirect to dashboard
      localStorage.setItem("user", JSON.stringify(loginData.user));
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full">
      {/* Title & Description */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-gray-500">
          Register your restaurant to start managing your business.
        </p>
      </div>

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Restaurant Name & Owner Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium">
              Restaurant Name
            </label>

            <input
              type="text"
              name="restaurant"
              required
              value={form.restaurant}
              onChange={handleChange}
              placeholder="Licious Restaurant"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Owner Name
            </label>

            <input
              type="text"
              name="owner"
              required
              value={form.owner}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Work Email & Phone Number Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="restaurant@email.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Business Type Select */}
        <div>
          <label className="block mb-2 font-medium">
            Business Type
          </label>

          <select
            name="business"
            required
            value={form.business}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Select Business Type</option>
            <option>Restaurant</option>
            <option>Cafe</option>
            <option>Bakery</option>
            <option>Fast Food</option>
            <option>Cloud Kitchen</option>
          </select>
        </div>

        {/* Passwords Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PasswordInput
            label="Password"
            name="password"
            required={true}
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            required={true}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
          />
        </div>

        {/* Terms and Conditions Checkbox */}
        <label className="flex items-start gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            className="mt-1"
          />

          <span>
            I agree to the
            <Link
              href="/terms"
              className="text-indigo-600 font-medium ml-1"
            >
              Terms & Conditions
            </Link>
          </span>
        </label>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-3 rounded-xl font-semibold text-white transition ${
            isFormValid
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Create Account
        </button>
      </form>

      {/* Link to Login */}
      <div className="mt-8 text-center text-gray-600">
        Already have an account?
        <Link
          href="/"
          className="ml-2 font-semibold text-indigo-600 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}