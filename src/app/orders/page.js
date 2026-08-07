"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import OrdersHeader from "../components/orders/OrdersHeader";

import OrderBoard from "../components/orders/OrderBoard";
import OrdersPagination from "../components/orders/OrdersPagination";
import NewOrderModal from "../components/orders/NewOrderModal";
import FloatingButton from "../components/orders/FloatingButton";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      params.append("page", page);
      params.append("limit", 10);

      const response = await fetch(
        `/api/orders?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        // If the current page no longer exists,
        // automatically move to the last valid page.
        if (
          data.pagination.totalPages > 0 &&
          page > data.pagination.totalPages
        ) {
          setPage(data.pagination.totalPages);
          return;
        }

        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, [search, statusFilter, page]);

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
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">

          <div className="p-4 sm:p-6 lg:p-8">

            {/* Navbar */}
            <Navbar
              search={search}
              setSearch={setSearch}
            />

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
                setOrders={setOrders}
                fetchOrders={fetchOrders}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>

            <OrdersPagination
              pagination={pagination}
              page={page}
              setPage={setPage}
            />

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