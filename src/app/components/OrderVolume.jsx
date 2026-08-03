"use client";

import { useEffect, useState } from "react";

export default function OrderVolume() {
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      const counts = [0, 0, 0, 0, 0, 0, 0];

      data.orders.forEach((order) => {
        const day = new Date(order.createdAt).getDay();
        counts[day]++;
      });

      setWeeklyData(counts);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-lg font-semibold">
          Daily Order Volume
        </h2>

        <button className="text-sm text-indigo-600 hover:underline">
          View Report
        </button>

      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-56 gap-2">

        {[
          { label: "Sun", color: "bg-indigo-100" },
          { label: "Mon", color: "bg-indigo-200" },
          { label: "Tue", color: "bg-indigo-300" },
          { label: "Wed", color: "bg-indigo-400" },
          { label: "Thu", color: "bg-indigo-500" },
          { label: "Fri", color: "bg-indigo-600" },
          { label: "Sat", color: "bg-indigo-700" },
        ].map((day, index) => (
          <div key={day.label} className="flex flex-col items-center flex-1">
            <div
              className={`w-full max-w-8 rounded-t ${day.color}`}
              style={{ height: `${weeklyData[index] * 25 + 20}px` }}
            ></div>
            <span className="mt-2 text-xs text-gray-500">{day.label}</span>
          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="mt-6 border-t pt-4 flex justify-between items-center">

        <div>
          <p className="text-xs text-gray-500">
            Weekly Orders
          </p>

          <p className="text-xl font-bold">
            845
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">
            Growth
          </p>

          <p className="text-green-500 font-semibold">
            +18.5%
          </p>
        </div>

      </div>

    </div>
  );
}