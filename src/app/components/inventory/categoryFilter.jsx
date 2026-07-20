"use client";

import {
  Download,
  Printer,
} from "lucide-react";

export default function CategoryFilter() {
  return (
    <div className="bg-white border rounded-2xl p-5">

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          <div>

            <p className="text-sm text-gray-500">
              Category
            </p>

            <select className="mt-1 border rounded-lg px-3 py-2 text-sm">

              <option>All Categories</option>

              <option>Vegetables</option>

              <option>Dairy</option>

              <option>Spices</option>

            </select>

          </div>

          <div className="flex gap-2">

            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">
              ALL ITEMS
            </button>

            <button className="px-4 py-2 rounded-lg border text-sm">
              ALERTS
            </button>

            <button className="px-4 py-2 rounded-lg border text-sm">
              ARCHIVED
            </button>

          </div>

        </div>

        <div className="flex gap-3">

          <button className="border rounded-lg p-2 hover:bg-gray-100">

            <Download size={18} />

          </button>

          <button className="border rounded-lg p-2 hover:bg-gray-100">

            <Printer size={18} />

          </button>

        </div>

      </div>

    </div>
  );
}