"use client";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryStats from "../components/inventory/InventoryStats";
import InventoryTable from "../components/inventory/InventoryTable";
import Pagination from "../components/inventory/Pagination";
import BottomStatusBar from "../components/inventory/BottomStatusBar";
import AddItemModal from "@/app/components/inventory/AddItemModal";
import EditItemModal from "@/app/components/inventory/EditItemModal";

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [inventory, setInventory] = useState([
    {
      id: 1,
      product: "Organic Cherry Tomatoes",
      subtitle: "Premium Grade A",
      sku: "TOM-CR-402",
      barcode: "4202",
      stock: 420,
      totalStock: 500,
      status: "instock",
      category: "Vegetables",
    },
    {
      id: 2,
      product: "Whole Milk 1L",
      subtitle: "Pasteurized / Local Farm",
      sku: "DRY-MIL-901",
      barcode: "901",
      stock: 45,
      totalStock: 200,
      status: "lowstock",
      category: "Dairy & Eggs",
    },
    {
      id: 3,
      product: "Prime Ribeye Steak",
      subtitle: "Vacuum Sealed",
      sku: "MT-RBY-884",
      barcode: "884",
      stock: 0,
      totalStock: 80,
      status: "outofstock",
      category: "Meat & Poultry",
    },
    {
      id: 4,
      product: "Saffron Threads",
      subtitle: "Premium Imported",
      sku: "SP-SFR-221",
      barcode: "221",
      stock: 12,
      totalStock: 20,
      status: "instock",
      category: "Spices",
    },
  ]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleSave = (updatedItem) => {
    const updatedInventory = inventory.map((item) => {
      if (item.id === updatedItem.id) {
        const percentage = (updatedItem.stock / updatedItem.totalStock) * 100;
        let status = "instock";

        if (percentage === 0) {
          status = "outofstock";
        } else if (percentage <= 10) {
          status = "lowstock";
        }

        return {
          ...updatedItem,
          status,
        };
      }

      return item;
    });

    setInventory(updatedInventory);
    setShowEditModal(false);
    setSelectedItem(null);
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
            <Navbar />

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
              <AddItemModal onClose={() => setShowAddModal(false)} />
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