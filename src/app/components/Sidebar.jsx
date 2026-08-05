"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
        console.error(error);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("user");

      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside
      className="
        hidden
        md:flex
        md:w-20
        lg:w-64
        h-screen
        bg-white
        border-r
        flex-col
        justify-between
        shrink-0
      "
    >
      {/* Top Section */}
      <div className="p-4 lg:p-6">
        <div>
          <h1 className="hidden lg:block text-xl font-bold text-indigo-600">
            Licious
          </h1>

          

          <p className="hidden lg:block text-xs text-gray-500">
            Order Management
          </p>
        </div>

        <div className="mt-8 space-y-2">

         <Link
  href="/dashboard"
  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
    pathname === "/dashboard"
      ? "bg-indigo-600 text-white"
      : "hover:bg-gray-100 text-gray-700"
  }`}
>
  <LayoutDashboard size={20} />
  <span>Dashboard</span>
</Link>

          <Link
  href="/orders"
  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
    pathname === "/orders"
      ? "bg-indigo-600 text-white"
      : "hover:bg-gray-100 text-gray-700"
  }`}
>
  <ShoppingCart size={20} />
  <span>Orders</span>
</Link>

        <Link
  href="/inventory"
  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
    pathname === "/inventory"
      ? "bg-indigo-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
  }`}
>
  <Package size={20} />
  <span>Inventory</span>
</Link>

        <Link
  href="/profile"
  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
    pathname === "/profile"
      ? "bg-indigo-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
  }`}
>
  <FileText size={20} />
  <span>Profile</span>
</Link>

        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 lg:p-6">

       

        <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">

          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
            {initials}
          </div>

          <div className="hidden lg:block">
            <p className="font-semibold text-sm">{profile?.name || "Loading..."}</p>
            <p className="text-xs text-gray-500">{profile?.role || ""}</p>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={20} />

          <span className="hidden lg:block">
            Logout
          </span>
        </button>

      </div>
    </aside>
  );
}