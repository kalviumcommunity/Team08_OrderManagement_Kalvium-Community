"use client";

import OrderColumn from "./OrderColumn";

export default function OrderBoard({ orders = [] }) {
  const newOrders = orders.filter(
    (order) => order.status === "PENDING"
  );

  const preparingOrders = orders.filter(
    (order) => order.status === "PREPARING"
  );

  const readyOrders = orders.filter(
    (order) => order.status === "READY"
  );

  async function updateOrderStatus(id, currentStatus) {
    try {
      let nextStatus = "";

      if (currentStatus === "new") {
        nextStatus = "PREPARING";
      } else if (currentStatus === "preparing") {
        nextStatus = "READY";
      } else {
        return;
      }

      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update order");
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }

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
          updateOrderStatus={updateOrderStatus}
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
          updateOrderStatus={updateOrderStatus}
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
          updateOrderStatus={updateOrderStatus}
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
          updateOrderStatus={updateOrderStatus}
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
          updateOrderStatus={updateOrderStatus}
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
          updateOrderStatus={updateOrderStatus}
        />

      </div>

    </div>
  );
}