"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-t-0 rounded-b-2xl px-6 py-4">

      <p className="text-sm text-gray-500">
        Showing 1 - 4 of 1,284 products
      </p>

      <div className="flex items-center gap-2">

        <button className="w-9 h-9 rounded-lg border hover:bg-gray-100 flex items-center justify-center">
          <ChevronLeft size={18} />
        </button>

        <button className="w-9 h-9 rounded-lg bg-indigo-600 text-white">
          1
        </button>

        <button className="w-9 h-9 rounded-lg border hover:bg-gray-100">
          2
        </button>

        <button className="w-9 h-9 rounded-lg border hover:bg-gray-100">
          3
        </button>

        <button className="w-9 h-9 rounded-lg border hover:bg-gray-100 flex items-center justify-center">
          <ChevronRight size={18} />
        </button>

      </div>

    </div>
  );
}