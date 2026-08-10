"use client";

import {
  Package,
  CircleCheck,
  TriangleAlert,
  CircleX,
} from "lucide-react";

export default function InventoryStats({ stats }) {
  const cards = [
    {
      title: "TOTAL PRODUCTS",
      value: stats?.totalProducts ?? 0,
      subtitle: "Total products in inventory",
      icon: Package,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "IN STOCK",
      value: stats?.inStock ?? 0,
      subtitle: "Healthy stock levels",
      icon: CircleCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "LOW STOCK",
      value: stats?.lowStock ?? 0,
      subtitle: "Requires attention",
      icon: TriangleAlert,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "OUT OF STOCK",
      value: stats?.outOfStock ?? 0,
      subtitle: "Action required",
      icon: CircleX,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  {stat.title}
                </p>

                <h2 className="text-3xl font-bold mt-3">{stat.value}</h2>

                <p className="text-sm text-gray-500 mt-2">
                  {stat.subtitle}
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}