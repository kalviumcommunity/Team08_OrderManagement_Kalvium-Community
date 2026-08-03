"use client";

import OrderCard from "./OrderCard";

export default function OrderColumn({
  title,
  color,
  orders,
  updateOrderStatus,
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

        <span className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
          {orders.length}
        </span>

      </div>

      {/* Cards */}
      <div className="space-y-4">

        {orders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            orderId={order.orderId}
            customer={order.customer}
            items={order.items}
            waitTime={order.waitTime}
            status={order.status}
            orderType={order.orderType}
            updateOrderStatus={updateOrderStatus}
          />
        ))}

      </div>

    </div>
  );
}