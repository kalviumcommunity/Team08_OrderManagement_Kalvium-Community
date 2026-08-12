"use client";

import { useEffect, useState } from "react";

/**
 * Navbar Component
 * Displays the top navigation bar with optional search input and logged-in user profile avatar.
 * 
 * @param {string} search - Current search query value
 * @param {Function} setSearch - State setter for updating search term
 */
export default function Navbar({
  search,
  setSearch,
}) {
  // State for user profile details
  const [profile, setProfile] = useState(null);

  // Fetch logged in user profile to display name and avatar initials
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile in navbar:", error);
      }
    }

    fetchProfile();
  }, []);

  // Compute initials for the user avatar bubble
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search Input Bar (Conditionally rendered when props provided) */}
      {typeof search === "string" && typeof setSearch === "function" && (
        <div className="w-full md:max-w-md lg:max-w-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      )}

      {/* Right Section: User Profile Avatar and Role */}
      <div className="flex items-center justify-between md:justify-end gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold">
              {profile?.name || "Loading..."}
            </p>
            <p className="text-xs text-gray-500">{profile?.role || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}