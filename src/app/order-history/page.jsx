"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import OrderHistoryTable from "../components/order-history/OrderHistoryTable";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchCompletedOrders() {
    try {
      const res = await fetch("/api/orders?status=COMPLETED", {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompletedOrders();

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("ORDER_UPDATED", () => {
      fetchCompletedOrders();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <Navbar />

            <div className="mt-6">
              <h1 className="text-3xl font-bold">Order History</h1>
              <p className="text-gray-500 mt-2">Completed orders</p>
            </div>

            <div className="mt-8">
              {loading ? <p>Loading...</p> : <OrderHistoryTable orders={orders} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
