"use client";

import { Plus } from "lucide-react";

export default function FloatingButton() {
  return (
    <button
      className="
        fixed
        bottom-5
        right-5
        z-50

        flex
        items-center
        gap-2

        bg-indigo-600
        hover:bg-indigo-700

        text-white
        font-medium

        px-5
        py-3

        rounded-full
        shadow-xl

        transition-all
        duration-300

        hover:scale-105
        active:scale-95
      "
    >
      <Plus size={20} />

      <span className="hidden sm:inline">
        New Order
      </span>
    </button>
  );
}