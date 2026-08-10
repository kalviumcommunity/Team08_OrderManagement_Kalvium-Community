"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState, useEffect, useCallback } from "react";

import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryStats from "../components/inventory/InventoryStats";
import InventoryTable from "../components/inventory/InventoryTable";
import Pagination from "../components/inventory/Pagination";
import BottomStatusBar from "../components/inventory/BottomStatusBar";
import AddItemModal from "@/app/components/inventory/AddItemModal";
import EditItemModal from "@/app/components/inventory/EditItemModal";

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchInventoryStats = useCallback(async () => {
    try {
      const response = await fetch("/api/products/stats", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      setStats(data);
    } catch (error) {
      console.error("Failed to fetch inventory stats:", error);
    }
  }, []);

  const fetchProducts = useCallback(async (
    searchValue = search,
    currentPage = page
  ) => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchValue.trim()) {
        params.set("search", searchValue);
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      const formattedProducts = data.products.map((product) => {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode || "-",
          stock: product.stock,
          maxStock: product.maxStock || 100,
          lowStockThreshold: product.lowStockThreshold,
          category: product.category || "General",
        };
      });

      setInventory(formattedProducts);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, [page, search]);

  const refreshInventoryData = useCallback(async () => {
    await Promise.all([
      fetchProducts(search),
      fetchInventoryStats(),
    ]);
  }, [fetchProducts, fetchInventoryStats, search]);

  useEffect(() => {
    refreshInventoryData();
  }, [refreshInventoryData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchProducts(search, 1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchProducts, search]);

  useEffect(() => {
    fetchProducts(search, page);
  }, [fetchProducts, page, search]);

  useEffect(() => {
    const events = new EventSource("/api/events");

    events.addEventListener("STOCK_UPDATED", () => {
      refreshInventoryData();
    });

    events.addEventListener("LOW_STOCK_ALERT", () => {
      refreshInventoryData();
    });

    return () => {
      events.close();
    };
  }, [refreshInventoryData]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: item.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete product");
        return;
      }

      const isLastItemOnPage = inventory.length === 1;

      if (isLastItemOnPage && page > 1) {
        setPage(page - 1);
      } else {
        await refreshInventoryData();
      }
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Something went wrong while deleting the product");
    }
  };

  const handleSave = async (updatedItem) => {
    try {
      const originalItem = inventory.find(
        (item) => item.id === updatedItem.id
      );

      if (!originalItem) return;

      const changeAmount = updatedItem.stock - originalItem.stock;

      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: updatedItem.id,
          changeAmount,
          reason: "Stock updated from Inventory Page",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      await refreshInventoryData();

      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update stock");
    }
  };

  return (
    <div className="mt-6 bg-white rounded-2xl border shadow-sm overflow-hidden">


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

            {/* Header */}
            <div className="mt-6">
              <InventoryHeader onAddItem={()=>setShowAddModal(true)}/>
            </div>

            {/* Statistics */}
            <div className="mt-6">
              <InventoryStats stats={stats} />
            </div>

            

            {/* Inventory Table */}
            <div className="mt-6">
              <InventoryTable
                inventory={inventory}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
              />
            </div>

            {showAddModal && (
              <AddItemModal
                onClose={() => setShowAddModal(false)}
                onSuccess={async () => {
                  setPage(1);
                  await fetchProducts(search, 1);
                  await fetchInventoryStats();
                }}
              />
            )}

            {showEditModal && (
              <EditItemModal
                item={selectedItem}
                onClose={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                onSave={handleSave}
              />
            )}

          </div>

        </main>

      </div>

      {/* Bottom Status */}
      <BottomStatusBar />

    </div>
  );
}