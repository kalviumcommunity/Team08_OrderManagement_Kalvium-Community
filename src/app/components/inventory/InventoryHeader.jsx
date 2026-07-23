"use client";

import { SlidersHorizontal, Plus } from "lucide-react";

export default function InventoryHeader({onAddItem}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

      {/* Left */}
      <div>

        <p className="text-sm text-gray-500">
          Main / Inventory
        </p>

        <h1 className="text-3xl font-bold text-gray-900 mt-1">
          Stock Management
        </h1>

      </div>

      {/* Right */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
        onClick={onAddItem}
        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition">

          <Plus size={18} />

          Add Item

        </button>

      </div>

    </div>
  );
}