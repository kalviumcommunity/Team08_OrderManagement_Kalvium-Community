"use client";

import { useEffect, useState } from "react";

export default function Navbar({
  search,
  setSearch,
}) {
  const [profile, setProfile] = useState(null);

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
        console.error("Failed to fetch profile:", error);
      }
    }

    fetchProfile();
  }, []);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      {/* Search Bar */}
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

      {/* Right Section */}
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