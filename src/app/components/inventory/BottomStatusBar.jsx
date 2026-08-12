"use client";

import {
  Database,
  ShieldCheck,
} from "lucide-react";

/**
 * BottomStatusBar Component
 * Sticky footer bar across the bottom of the inventory screen.
 * Displays database sync status, security health indicator, and overall inventory valuation.
 */
export default function BottomStatusBar() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-8">
      <div className="max-w-full px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Status Indicators */}
        <div className="flex items-center gap-6">
          {/* Last Database Sync Time */}
          <div className="flex items-center gap-2 text-sm">
            <Database
              size={16}
              className="text-green-400"
            />
            Last Sync
            <span className="text-gray-400">
              2 minutes ago
            </span>
          </div>

          {/* Operational Systems Status */}
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck
              size={16}
              className="text-green-400"
            />
            Systems Operational
          </div>
        </div>

        {/* Total Estimated Inventory Valuation */}
        <div className="text-sm">
          Inventory Value
          <span className="ml-2 font-semibold text-green-400">
            $342,504.22
          </span>
        </div>
      </div>
    </footer>
  );
}