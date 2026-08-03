"use client";

import { useEffect, useState } from "react";

export default function StatsCards() {
  const [stats, setStats] = useState({
    newOrders: 0,
    preparing: 0,
    ready: 0,
    lowStock: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const orderRes = await fetch("/api/orders");
      const productRes = await fetch("/api/products");

      const orderData = await orderRes.json();
      const productData = await productRes.json();

      const orders = orderData.orders || [];
      const products = productData.products || [];

      const newOrders = orders.filter((order) => order.status === "PENDING").length;
      const preparing = orders.filter((order) => order.status === "PREPARING").length;
      const ready = orders.filter((order) => order.status === "READY").length;
      const lowStock = products.filter(
        (product) => product.stock < product.lowStockThreshold
      ).length;

      setStats({
        newOrders,
        preparing,
        ready,
        lowStock,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mt-8">

      {/* New Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          New Orders
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {stats.newOrders}
        </h2>

        <p className="text-green-500 text-sm mt-3">
          +12% vs last hour
        </p>
      </div>

      {/* Preparing */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Preparing
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {stats.preparing}
        </h2>

        <p className="text-gray-500 text-sm mt-3">
          Average: 18 min
        </p>
      </div>

      {/* Ready */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Ready
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {stats.ready}
        </h2>

        <p className="text-gray-500 text-sm mt-3">
          Waiting pickup
        </p>
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Revenue
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          $14.2K
        </h2>

        <p className="text-green-500 text-sm mt-3">
          +4.5%
        </p>
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Low Stock
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {stats.lowStock}
        </h2>

        <p className="text-red-500 text-sm mt-3">
          Restock needed
        </p>
      </div>

    </div>
  );
}