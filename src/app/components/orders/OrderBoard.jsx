"use client";

import OrderColumn from "./OrderColumn";

export default function OrderBoard({ orders = [], fetchOrders }) {
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

      {/* Desktop / Tablet */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">

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
              (item) => `${item.quantity} × ${item.product.name}`
            ),
          }))}
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
              (item) => `${item.quantity} × ${item.product.name}`
            ),
          }))}
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
              (item) => `${item.quantity} × ${item.product.name}`
            ),
          }))}
          fetchOrders={fetchOrders}
        />

      </div>

      {/* Mobile & Tablet */}
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
              (item) => `${item.quantity} × ${item.product.name}`
            ),
          }))}
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
              (item) => `${item.quantity} × ${item.product.name}`
            ),
          }))}
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
              (item) => `${item.quantity} × ${item.product.name}`
            ),
          }))}
          fetchOrders={fetchOrders}
        />

      </div>

    </div>
  );
}