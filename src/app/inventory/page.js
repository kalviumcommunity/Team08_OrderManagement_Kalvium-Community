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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(search)}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch products");
        return;
      }

      const data = await response.json();

      const formattedProducts = data.products.map((product) => {
        let status = "instock";

        if (product.stock === 0) {
          status = "outofstock";
        } else if (product.stock <= product.lowStockThreshold) {
          status = "lowstock";
        }

        return {
          id: product.id,
          product: product.name,
          subtitle: product.description || "",
          sku: product.sku,
          barcode: product.barcode || "-",
          stock: product.stock,
          totalStock: product.maxStock || 100,
          status,
          category: product.category || "General",
        };
      });

      setInventory(formattedProducts);
    } catch (error) {
      console.error(error);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();

    const events = new EventSource("/api/events");

    events.addEventListener("STOCK_UPDATED", () => {
      fetchProducts();
    });

    events.addEventListener("LOW_STOCK_ALERT", () => {
      fetchProducts();
    });

    return () => {
      events.close();
    };
  }, [fetchProducts]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
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

      await fetchProducts();

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
              <InventoryStats />
            </div>

            

            {/* Inventory Table */}
            <div className="mt-6">
              <InventoryTable
                inventory={inventory}
                onEdit={handleEdit}
              />
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination />
            </div>

            {showAddModal && (
              <AddItemModal
                onClose={() => setShowAddModal(false)}
                fetchProducts={fetchProducts}
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