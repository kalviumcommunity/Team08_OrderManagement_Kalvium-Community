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

/**
 * Inventory Management Page Component (Route: `/inventory`)
 * Manages restaurant product catalog and stock levels:
 * - Real-time stock counts (in-stock, low-stock, out-of-stock)
 * - Searchable and paginated inventory table
 * - Add product modal
 * - Edit stock modal
 * - Delete product confirmation
 * - Real-time SSE synchronization
 */
export default function InventoryPage() {
  // Modal visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Data and filter states
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  /**
   * Fetches aggregate inventory statistics (total, low stock, out of stock)
   */
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

  /**
   * Fetches paginated products according to current search keyword and page number
   */
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

      // Map response to consistent inventory item schema
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

  /**
   * Refreshes both products table and inventory metrics
   */
  const refreshInventoryData = useCallback(async () => {
    await Promise.all([
      fetchProducts(search),
      fetchInventoryStats(),
    ]);
  }, [fetchProducts, fetchInventoryStats, search]);

  // Initial load on mount
  useEffect(() => {
    refreshInventoryData();
  }, [refreshInventoryData]);

  // Debounced search query trigger
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchProducts(search, 1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchProducts, search]);

  // Re-fetch products when page changes
  useEffect(() => {
    fetchProducts(search, page);
  }, [fetchProducts, page, search]);

  // Listen for real-time stock updates from SSE stream
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

  /**
   * Opens the Edit Item modal for a specific inventory row
   */
  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  /**
   * Deletes a product from the inventory after confirmation
   */
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

      // If deleting the last item on the page, go to previous page
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

  /**
   * Handles saving updated stock quantity from the Edit modal
   */
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
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Search Navbar */}
            <Navbar
              search={search}
              setSearch={setSearch}
            />

            {/* Header & Add Item Action */}
            <div className="mt-6">
              <InventoryHeader onAddItem={() => setShowAddModal(true)} />
            </div>

            {/* Metric Statistics Cards */}
            <div className="mt-6">
              <InventoryStats stats={stats} />
            </div>

            {/* Inventory Items Table */}
            <div className="mt-6">
              <InventoryTable
                inventory={inventory}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>

            {/* Pagination Controls */}
            <div className="mt-6">
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
              />
            </div>

            {/* Add Product Modal */}
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

            {/* Edit Stock Modal */}
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

      {/* System Status Indicator Bar */}
      <BottomStatusBar />
    </div>
  );
}