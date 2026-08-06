"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import OrdersHeader from "../components/orders/OrdersHeader";

import OrderBoard from "../components/orders/OrderBoard";
import NewOrderModal from "../components/orders/NewOrderModal";
import FloatingButton from "../components/orders/FloatingButton";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();

    const events = new EventSource("/api/events");

    events.addEventListener("ORDER_CREATED", () => {
      fetchOrders();
    });

    events.addEventListener("ORDER_UPDATED", () => {
      fetchOrders();
    });

    return () => {
      events.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">

          <div className="p-4 sm:p-6 lg:p-8">

            {/* Navbar */}
            <Navbar />

            {/* Page Header */}
            <div className="mt-6">
              <OrdersHeader
                search={search}
                setSearch={setSearch}
              />
            </div>

            {/* Order Board */}
            <div className="mt-6">
              <OrderBoard
                orders={orders}
                fetchOrders={fetchOrders}
              />
            </div>

          </div>

        </main>

      </div>

      <FloatingButton
        onClick={() => setShowModal(true)}
      />

      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          fetchOrders={fetchOrders}
        />
      )}

    </div>
  );
}