"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";

export default function SignupForm() {

const router = useRouter();

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

  // TODO: Call Login API

  router.push("/dashboard");
};

  return (
    <div className="w-full">

      <div className="mb-8">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-gray-500">
          Register your restaurant to start managing your business.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Restaurant + Owner */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>

            <label className="block mb-2 font-medium">
              Restaurant Name
            </label>

            <input
              type="text"
              name="restaurant"
              value={form.restaurant}
              onChange={handleChange}
              placeholder="FoodOps Restaurant"
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
              value={form.owner}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

          </div>

        </div>

        {/* Email + Phone */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>

            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
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
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

          </div>

        </div>

        {/* Business Type */}

        <div>

          <label className="block mb-2 font-medium">
            Business Type
          </label>

          <select
            name="business"
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

        {/* Passwords */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <PasswordInput
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
          />

        </div>

        {/* Checkbox */}

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

        {/* Button */}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-xl font-semibold"
        >
          Create Account
        </button>

      </form>

      <div className="mt-8 text-center text-gray-600">

        Already have an account?

        <Link
          href="/login"
          className="ml-2 font-semibold text-indigo-600 hover:underline"
        >
          Sign In
        </Link>

      </div>

    </div>
  );
}