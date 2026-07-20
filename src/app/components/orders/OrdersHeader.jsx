"use client";

import {
  Search,
  Bell,
  Settings,
} from "lucide-react";

export default function OrdersHeader() {
  return (
    <div className="w-full">

      {/* Top Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        {/* Left */}
        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Live Orders
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Real-time status of 18 active orders
          </p>

        </div>

        {/* Right */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">

          {/* Search */}
          <div className="relative w-full sm:w-80">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search order ID, customer..."
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          

        </div>

      </div>

    </div>
  );
}