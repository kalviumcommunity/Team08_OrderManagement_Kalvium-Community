"use client";

import {
  Clock3,
  User,
  CookingPot,
  CheckCircle2,
} from "lucide-react";

/**
 * OrderCard Component
 * Represents a single order ticket inside a Kanban column.
 * Shows ID, customer name, line items, wait time, and a linear status transition button
 * (Accept & Prep -> Mark Ready -> Complete).
 * 
 * @param {string} id - Order ID
 * @param {string} customer - Customer name
 * @param {Array} items - List of item strings (e.g., "2 × Product Name")
 * @param {string} waitTime - Humanized waiting time (e.g., "5 min")
 * @param {string} status - Current card status ('new', 'preparing', 'ready')
 * @param {string} orderType - Order type ('delivery', 'takeaway', 'dinein')
 * @param {Array} orders - List of all orders
 * @param {Function} setOrders - Setter for local orders state
 * @param {Function} fetchOrders - Re-fetch orders from API
 */
export default function OrderCard({
  id,
  customer,
  items,
  waitTime,
  status,
  orderType,
  setOrders,
  fetchOrders,
}) {
  // Button styling corresponding to next step in workflow
  const buttonStyles = {
    new: "bg-blue-600 hover:bg-blue-700 text-white",
    preparing: "bg-amber-500 hover:bg-amber-600 text-white",
    ready: "bg-green-600 hover:bg-green-700 text-white",
  };

  const buttonText = {
    new: "Accept & Prep",
    preparing: "Mark Ready",
    ready: "Complete",
  };

  const typeStyles = {
    delivery: "bg-green-100 text-green-700",
    takeaway: "bg-purple-100 text-purple-700",
    dinein: "bg-blue-100 text-blue-700",
  };

  const typeText = {
    delivery: "Delivery",
    takeaway: "Takeaway",
    dinein: "Dine In",
  };

  /**
   * Advances the order to the next sequential status in the lifecycle:
   * new (PENDING) -> PREPARING -> READY -> COMPLETED
   */
  const handleStatusUpdate = async () => {
    let nextStatus = "";

    if (status === "new") {
      nextStatus = "PREPARING";
    } else if (status === "preparing") {
      nextStatus = "READY";
    } else if (status === "ready") {
      nextStatus = "COMPLETED";
    }

    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update order status");
        return;
      }

      // Optimistically update order status in state
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== id) return order;

          return {
            ...order,
            status: nextStatus,
          };
        })
      );

      // Re-fetch latest authoritative data from server
      await fetchOrders();
    } catch (error) {
      console.error("Failed to transition order status:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-5">
      {/* Top Details: Order ID, Type Badge & Wait Time */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900">
            #{id.slice(0, 8)}
          </h3>

          <span
            className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${
              typeStyles[orderType] || typeStyles.delivery
            }`}
          >
            {typeText[orderType] || "Delivery"}
          </span>
        </div>

        <span className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
          <Clock3 size={14} />
          {waitTime}
        </span>
      </div>

      {/* Customer Name */}
      <div className="flex items-center gap-2 mt-4">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
          <User size={18} className="text-indigo-600" />
        </div>

        <div>
          <p className="font-semibold text-gray-800">
            {customer}
          </p>

          <p className="text-xs text-gray-500">
            Customer
          </p>
        </div>
      </div>

      {/* Ordered Line Items List */}
      <div className="mt-5">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Items
        </p>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <CookingPot
                size={16}
                className="text-gray-400"
              />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Advance Order Status Action Button */}
      <button
        onClick={handleStatusUpdate}
        className={`mt-6 w-full rounded-xl py-3 font-medium transition ${buttonStyles[status]}`}
      >
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 size={18} />
          {buttonText[status]}
        </div>
      </button>
    </div>
  );
}