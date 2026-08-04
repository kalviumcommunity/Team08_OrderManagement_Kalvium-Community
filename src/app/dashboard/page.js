"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import ActiveOrders from "../components/ActiveOrders";
import OrderVolume from "../components/OrderVolume";
import InventoryAlerts from "../components/InventoryAlerts";
import LogisticsHub from "../components/LogisticsHub";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Unauthorized to access reports dashboard.");
          return;
        }
        throw new Error("Failed to fetch dashboard reports");
      }
      const reportData = await res.json();
      setData(reportData);
      setError(null);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Failed to load reports. Please try logging in again.");
    }
  };

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders", {
        credentials: "include",
      });

      const responseData = await res.json();

      if (res.ok) {
        setOrders(responseData.orders || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products", {
        credentials: "include",
      });

      const responseData = await res.json();

      if (res.ok) {
        setProducts(responseData.products || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      await Promise.all([fetchReports(), fetchOrders(), fetchProducts()]);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("ORDER_CREATED", () => {
      fetchOrders();
    });

    eventSource.addEventListener("ORDER_UPDATED", () => {
      fetchOrders();
    });

    eventSource.addEventListener("STOCK_UPDATED", () => {
      fetchProducts();
    });

    eventSource.addEventListener("LOW_STOCK_ALERT", () => {
      fetchProducts();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">

          <div className="p-4 sm:p-6 lg:p-8">

            {/* Navbar */}
            <Navbar />

            {loading ? (
              <div className="flex justify-center items-center h-[50vh] mt-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mt-8">
                {error}
              </div>
            ) : (
              <>
                {/* Stats */}
                <StatsCards stats={data?.stats} />

                {/* Orders + Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

                  <ActiveOrders orders={orders.slice(0, 5)} />

                  <OrderVolume orders={orders} />

                </div>

                {/* Inventory + Logistics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

                  <InventoryAlerts products={products} onRestockSuccess={fetchProducts} />

                  <LogisticsHub />

                </div>
              </>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}
