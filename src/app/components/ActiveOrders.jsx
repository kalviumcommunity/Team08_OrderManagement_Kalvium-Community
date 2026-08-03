"use client";

import { useEffect, useState } from "react";

export default function ActiveOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="col-span-1 lg:col-span-2 bg-white border rounded-xl shadow-sm p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">

        <h2 className="text-lg font-semibold">
          Active Orders
        </h2>

        <div className="flex gap-3">

          <button className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition">
            Filter
          </button>

          <button className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition">
            Export
          </button>

        </div>

      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">

        <table className="min-w-[700px] w-full">

          <thead>

            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">

              <th className="py-3">Order ID</th>

              <th>Customer</th>

              <th>Items</th>

              <th>Status</th>

              <th className="text-right">Amount</th>

            </tr>

          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No Active Orders
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-4 font-medium">
                    {order.id.slice(0, 8)}
                  </td>

                  <td>{order.customerName}</td>

                  <td>
                    {order.items
                      .map((item) => `${item.product.name} ×${item.quantity}`)
                      .join(", ")}
                  </td>

                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium
                        ${
                          order.status === "PENDING"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "PREPARING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="text-right">--</td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
}