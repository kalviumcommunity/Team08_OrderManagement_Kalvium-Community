"use client";

import {
  Database,
  ShieldCheck,
} from "lucide-react";

export default function BottomStatusBar() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-8">

      <div className="max-w-full px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">

        <div className="flex items-center gap-6">

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

          <div className="flex items-center gap-2 text-sm">

            <ShieldCheck
              size={16}
              className="text-green-400"
            />

            Systems Operational

          </div>

        </div>

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