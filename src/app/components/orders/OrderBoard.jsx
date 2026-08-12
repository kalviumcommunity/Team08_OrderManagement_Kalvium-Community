"use client";

import OrderColumn from "./OrderColumn";

/**
 * OrderBoard Component
 * Kanban-style order board categorizing orders into three status columns:
 * 1. New Orders (PENDING)
 * 2. Preparing (PREPARING)
 * 3. Ready (READY)
 * 
 * Supports filter buttons (All, Pending, Preparing, Ready) and responsive column layouts.
 * 
 * @param {Array} orders - List of active order records
 * @param {Function} setOrders - State updater for orders list
 * @param {Function} fetchOrders - Function to re-fetch orders from API
 * @param {string} statusFilter - Currently selected status filter
 * @param {Function} setStatusFilter - State updater for status filter
 */
export default function OrderBoard({
  orders = [],
  setOrders,
  fetchOrders,
  statusFilter,
  setStatusFilter,
}) {
  // Filter orders by specific status columns
  const newOrders = orders.filter(
    (order) => order.status === "PENDING"
  );

  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  );

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  );

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            statusFilter === ""
              ? "bg-indigo-600 text-white"
              : "border bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            statusFilter === "PENDING"
              ? "bg-indigo-600 text-white"
              : "border bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => setStatusFilter("PREPARING")}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            statusFilter === "PREPARING"
              ? "bg-indigo-600 text-white"
              : "border bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Preparing
        </button>

        <button
          onClick={() => setStatusFilter("READY")}
          className={`px-4 py-2 rounded-lg transition font-medium ${
            statusFilter === "READY"
              ? "bg-indigo-600 text-white"
              : "border bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Ready
        </button>
      </div>

      {/* Desktop / Large Screen Kanban Columns Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {/* Column 1: New Orders */}
        <OrderColumn
          title="New Orders"
          color="bg-blue-500"
          orders={newOrders.map((order) => ({
            id: order.id,
            customer: order.customerName,
            waitTime: `${Math.floor(
              (Date.now() - new Date(order.createdAt)) / 60000
            )} min`,
            status: "new",
            orderType: "delivery",
            items: order.items.map(
              (item) => `${item.quantity} × ${item.product?.name || "Product"}`
            ),
          }))}
          setOrders={setOrders}
          fetchOrders={fetchOrders}
        />

        {/* Column 2: Preparing */}
        <OrderColumn
          title="Preparing"
          color="bg-yellow-500"
          orders={preparingOrders.map((order) => ({
            id: order.id,
            customer: order.customerName,
            waitTime: `${Math.floor(
              (Date.now() - new Date(order.createdAt)) / 60000
            )} min`,
            status: "preparing",
            orderType: "delivery",
            items: order.items.map(
              (item) => `${item.quantity} × ${item.product?.name || "Product"}`
            ),
          }))}
          setOrders={setOrders}
          fetchOrders={fetchOrders}
        />

        {/* Column 3: Ready */}
        <OrderColumn
          title="Ready"
          color="bg-green-500"
          orders={readyOrders.map((order) => ({
            id: order.id,
            customer: order.customerName,
            waitTime: `${Math.floor(
              (Date.now() - new Date(order.createdAt)) / 60000
            )} min`,
            status: "ready",
            orderType: "delivery",
            items: order.items.map(
              (item) => `${item.quantity} × ${item.product?.name || "Product"}`
            ),
          }))}
          setOrders={setOrders}
          fetchOrders={fetchOrders}
        />
      </div>

      {/* Mobile & Tablet Vertical Stack */}
      <div className="flex lg:hidden flex-col gap-6">
        <OrderColumn
          title="New Orders"
          color="bg-blue-500"
          orders={newOrders.map((order) => ({
            id: order.id,
            customer: order.customerName,
            waitTime: `${Math.floor(
              (Date.now() - new Date(order.createdAt)) / 60000
            )} min`,
            status: "new",
            orderType: "delivery",
            items: order.items.map(
              (item) => `${item.quantity} × ${item.product?.name || "Product"}`
            ),
          }))}
          setOrders={setOrders}
          fetchOrders={fetchOrders}
        />

        <OrderColumn
          title="Preparing"
          color="bg-yellow-500"
          orders={preparingOrders.map((order) => ({
            id: order.id,
            customer: order.customerName,
            waitTime: `${Math.floor(
              (Date.now() - new Date(order.createdAt)) / 60000
            )} min`,
            status: "preparing",
            orderType: "delivery",
            items: order.items.map(
              (item) => `${item.quantity} × ${item.product?.name || "Product"}`
            ),
          }))}
          setOrders={setOrders}
          fetchOrders={fetchOrders}
        />

        <OrderColumn
          title="Ready"
          color="bg-green-500"
          orders={readyOrders.map((order) => ({
            id: order.id,
            customer: order.customerName,
            waitTime: `${Math.floor(
              (Date.now() - new Date(order.createdAt)) / 60000
            )} min`,
            status: "ready",
            orderType: "delivery",
            items: order.items.map(
              (item) => `${item.quantity} × ${item.product?.name || "Product"}`
            ),
          }))}
          setOrders={setOrders}
          fetchOrders={fetchOrders}
        />
      </div>
    </div>
  );
}