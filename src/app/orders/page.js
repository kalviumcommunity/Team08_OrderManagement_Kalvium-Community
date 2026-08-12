"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import OrdersHeader from "../components/orders/OrdersHeader";
import OrderBoard from "../components/orders/OrderBoard";
import OrdersPagination from "../components/orders/OrdersPagination";
import NewOrderModal from "../components/orders/NewOrderModal";
import FloatingButton from "../components/orders/FloatingButton";

/**
 * Orders Management Kanban & List View Page (Route: `/orders`)
 * Features:
 * - Live Kanban board grouped by status (Pending, Preparing, Ready, Completed, Cancelled)
 * - Filtering by order status and customer search
 * - Modal for creating new walk-in / customer orders
 * - Real-time SSE synchronization for order creation & progression
 */
export default function OrdersPage() {
  // Query and pagination states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Orders data and modal visibility states
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  /**
   * Fetches paginated orders with current status filter and search query
   */
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
        // If current page exceeds available pages, clamp to the last page
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

  // Initial fetch and real-time SSE listener setup
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

  // Reset to page 1 whenever search query changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Reset to page 1 whenever status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content View */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Top Search & Profile Navbar */}
            <Navbar
              search={search}
              setSearch={setSearch}
            />

            {/* Orders Header */}
            <div className="mt-6">
              <OrdersHeader />
            </div>

            {/* Kanban Columns / Order Cards Board */}
            <div className="mt-6">
              <OrderBoard
                orders={orders}
                setOrders={setOrders}
                fetchOrders={fetchOrders}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>

            {/* Orders Table Pagination */}
            <OrdersPagination
              pagination={pagination}
              page={page}
              setPage={setPage}
            />
          </div>
        </main>
      </div>

      {/* Floating Action Button for Placing New Order */}
      <FloatingButton
        onClick={() => setShowModal(true)}
      />

      {/* Modal for Creating New Order */}
      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          fetchOrders={fetchOrders}
        />
      )}
    </div>
  );
}