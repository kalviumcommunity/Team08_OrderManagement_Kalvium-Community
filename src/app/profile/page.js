"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";
import ProfileCard from "@/app/components/profile/ProfileCard";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-4 sm:p-6 lg:p-8">

          <ProfileCard profile={profile} loading={loading} />

        </main>

      </div>

    </div>
  );
}
