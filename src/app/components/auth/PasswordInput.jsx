"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable PasswordInput Component
 * Includes toggle button for showing/hiding password plaintext,
 * error state styling, and accessibility labels.
 * 
 * @param {string} label - Input label text
 * @param {string} name - HTML input name and id
 * @param {string} value - Current input value
 * @param {Function} onChange - Event handler callback
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Optional error message text
 * @param {boolean} disabled - Whether the input is disabled
 */
export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  error = "",
  disabled = false,
}) {
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      {/* Input container with absolute toggle icon button */}
      <div className="relative">
        <input
          id={name}
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className={`
            w-full
            rounded-xl
            border
            py-3
            pl-4
            pr-12
            text-sm
            sm:text-base
            outline-none
            transition-all
            duration-200
            ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-300"
                : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
            }
            ${
              disabled
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
            }
          `}
        />

        {/* Visibility Toggle Button */}
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-indigo-600 transition-colors"
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}