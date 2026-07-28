"use client";

import { useState } from "react";
import LogisticsModal from "@/app/components/LogisticsModal";

export default function LogisticsHub() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">

        <h2 className="text-lg font-semibold">
          Logistics Hub
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-indigo-600 hover:underline"
        >
          View Map
        </button>

      </div>

      {/* Map Placeholder */}
      <div className="h-52 sm:h-60 rounded-xl bg-gradient-to-br from-indigo-100 to-gray-100 border flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-2">
            🗺️
          </div>

          <p className="font-medium text-gray-700">
            Live Delivery Map
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Google Maps Integration Coming Soon
          </p>

        </div>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        <div className="bg-gray-50 rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Active Deliveries
          </p>

          <h3 className="text-2xl font-bold mt-2">
            18
          </h3>

        </div>

        <div className="bg-gray-50 rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Avg Time
          </p>

          <h3 className="text-2xl font-bold mt-2">
            25 min
          </h3>

        </div>

        <div className="bg-gray-50 rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Delivered Today
          </p>

          <h3 className="text-2xl font-bold mt-2">
            164
          </h3>

        </div>

        <div className="bg-gray-50 rounded-xl p-4">

          <p className="text-sm text-gray-500">
            Drivers Online
          </p>

          <h3 className="text-2xl font-bold mt-2">
            12
          </h3>

        </div>

      </div>

      {/* Delivery Partners */}
      <div className="mt-6">

        <h3 className="font-semibold mb-3">
          Delivery Partners
        </h3>

        <div className="space-y-3">

          <div className="flex items-center justify-between border rounded-lg p-3">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                🚴
              </div>

              <div>

                <p className="font-medium">
                  Rahul Kumar
                </p>

                <p className="text-xs text-gray-500">
                  Delivering Order #1002
                </p>

              </div>

            </div>

            <span className="text-green-600 text-sm font-medium">
              On Route
            </span>

          </div>

          <div className="flex items-center justify-between border rounded-lg p-3">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                🛵
              </div>

              <div>

                <p className="font-medium">
                  Priya Sharma
                </p>

                <p className="text-xs text-gray-500">
                  Delivering Order #1005
                </p>

              </div>

            </div>

            <span className="text-blue-600 text-sm font-medium">
              5 mins Away
            </span>

          </div>

        </div>

      </div>

      {showModal && (
        <LogisticsModal
          onClose={() => setShowModal(false)}
        />
      )}

    </div>
  );
}