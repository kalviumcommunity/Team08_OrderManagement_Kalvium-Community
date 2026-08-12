"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import OrderHistoryTable from "../components/order-history/OrderHistoryTable";

/**
 * Order History Page Component (Route: `/order-history`)
 * Displays past completed orders, listening for real-time updates via Server-Sent Events.
 */
export default function OrderHistoryPage() {
  // State for storing list of completed orders and table loading status
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches only orders with status 'COMPLETED'
   */
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
      console.error("Failed to fetch order history:", error);
    } finally {
      setLoading(false);
    }
  }

  // Load initial orders and subscribe to real-time events on mount
  useEffect(() => {
    fetchCompletedOrders();

    // Connect to SSE stream to auto-refresh history when orders change
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
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Top Navigation */}
            <Navbar />

            {/* Header Title */}
            <div className="mt-6">
              <h1 className="text-3xl font-bold">Order History</h1>
              <p className="text-gray-500 mt-2">Completed orders</p>
            </div>

            {/* Completed Orders Table */}
            <div className="mt-8">
              {loading ? <p>Loading...</p> : <OrderHistoryTable orders={orders} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
