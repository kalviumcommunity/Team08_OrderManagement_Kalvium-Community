"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  CookingPot,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

export default function LogisticsHub({ refreshKey }) {
  const [summary, setSummary] = useState({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedToday: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/orders/summary", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch order summary");
      }

      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch order summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshKey]);

  const stats = [
    {
      title: "Pending Orders",
      value: summary.pendingOrders,
      icon: Clock3,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Preparing",
      value: summary.preparingOrders,
      icon: CookingPot,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Ready",
      value: summary.readyOrders,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Completed Today",
      value: summary.completedToday,
      icon: ClipboardCheck,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Order Operations
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Real-time overview of current restaurant orders
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-60 text-gray-500">
          Loading order summary...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {stat.title}
                    </p>

                    <h3 className="text-2xl font-bold mt-2">
                      {stat.value}
                    </h3>
                  </div>

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
