"use client";

import OrderCard from "./OrderCard";

/**
 * OrderColumn Component
 * Renders a vertical column in the Kanban board containing orders for a specific state.
 * 
 * @param {string} title - Column header title (e.g. "New Orders", "Preparing", "Ready")
 * @param {string} color - Dot indicator color class (e.g. "bg-blue-500")
 * @param {Array} orders - Orders assigned to this column
 * @param {Function} setOrders - State updater for orders
 * @param {Function} fetchOrders - Re-fetch orders from API
 */
export default function OrderColumn({
  title,
  color,
  orders = [],
  setOrders,
  fetchOrders,
}) {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 h-fit">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${color}`}
          ></div>

          <h2 className="text-lg font-semibold text-gray-800">
            {title}
          </h2>
        </div>

        {/* Order Count Badge */}
        <span className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
          {orders.length}
        </span>
      </div>

      {/* Order Cards Stack */}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            customer={order.customer}
            items={order.items}
            waitTime={order.waitTime}
            status={order.status}
            orderType={order.orderType}
            orders={orders}
            setOrders={setOrders}
            fetchOrders={fetchOrders}
          />
        ))}
      </div>
    </div>
  );
}