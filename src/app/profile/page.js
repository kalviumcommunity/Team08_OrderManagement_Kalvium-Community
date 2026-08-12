"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";
import ProfileCard from "@/app/components/profile/ProfileCard";

/**
 * Profile Page Component (Route: `/profile`)
 * Displays user account information (name, email, role, restaurant details).
 */
export default function ProfilePage() {
  // State for storing fetched profile data and loading status
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches profile data for the currently authenticated user
   */
  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }

  // Load user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <Navbar />

        {/* Profile Card View */}
        <main className="p-4 sm:p-6 lg:p-8">
          <ProfileCard profile={profile} loading={loading} />
        </main>
      </div>
    </div>
  );
}
