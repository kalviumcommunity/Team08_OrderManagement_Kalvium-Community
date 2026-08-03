"use client";

import { useEffect, useState } from "react";
import OrderColumn from "./OrderColumn";

export default function OrderBoard({
  search,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [search]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("ORDER_CREATED", () => {
      fetchOrders();
    });

    eventSource.addEventListener("ORDER_UPDATED", () => {
      fetchOrders();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(
        `/api/orders?search=${encodeURIComponent(search)}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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

      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  }

  const formatOrders = (status) => {
    return orders
      .filter((order) => order.status === status)
      .map((order) => ({
        id: order.id,
        orderId: order.id.slice(0, 8).toUpperCase(),
        customer: order.customerName,
        waitTime: `${Math.floor(
          (Date.now() - new Date(order.createdAt).getTime()) / 60000
        )} min`,
        status: status === "PENDING" ? "new" : status.toLowerCase(),
        orderType: "delivery",
        items: order.items.map(
          (item) => `${item.quantity} × ${item.product.name}`
        ),
      }));
  };

  const newOrders = formatOrders("PENDING");
  const preparingOrders = formatOrders("PREPARING");
  const readyOrders = formatOrders("READY");

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading Orders...
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No Orders Found
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* Desktop / Tablet */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">

        <OrderColumn
          title="New Orders"
          color="bg-blue-500"
          orders={newOrders}
          updateOrderStatus={updateOrderStatus}
        />

        <OrderColumn
          title="Preparing"
          color="bg-yellow-500"
          orders={preparingOrders}
          updateOrderStatus={updateOrderStatus}
        />

        <OrderColumn
          title="Ready"
          color="bg-green-500"
          orders={readyOrders}
          updateOrderStatus={updateOrderStatus}
        />

      </div>

      {/* Mobile & Tablet */}
      <div className="flex lg:hidden flex-col gap-6">

        <OrderColumn
          title="New Orders"
          color="bg-blue-500"
          orders={newOrders}
          updateOrderStatus={updateOrderStatus}
        />

        <OrderColumn
          title="Preparing"
          color="bg-yellow-500"
          orders={preparingOrders}
          updateOrderStatus={updateOrderStatus}
        />

        <OrderColumn
          title="Ready"
          color="bg-green-500"
          orders={readyOrders}
          updateOrderStatus={updateOrderStatus}
        />

      </div>

    </div>
  );
}