"use client";

import { useEffect, useState } from 'react';
import RestockModal from '@/app/components/inventory/RestockModal';
import RestockHistory from '@/app/components/inventory/RestockHistory';

export default function InventoryAlerts() {
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockHistory, setRestockHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchInventoryAlerts();
  }, []);

  const fetchInventoryAlerts = async () => {
    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      const inventoryAlerts = data.products
        .filter((product) => product.stock < product.lowStockThreshold)
        .map((product) => {
          const percentage = (product.stock / product.lowStockThreshold) * 100;

          return {
            id: product.id,
            product: product.name,
            sku: product.id.slice(0, 8),
            stock: product.stock,
            totalStock: product.lowStockThreshold,
            status: percentage <= 30 ? "Low Stock" : "Medium Stock",
            message:
              percentage <= 30
                ? "Reorder immediately to avoid shortages."
                : "Plan restocking within the next delivery cycle.",
            tone: percentage <= 30 ? "red" : "yellow",
          };
        });

      setAlerts(inventoryAlerts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestock = (item) => {
    setSelectedItem(item);
    setShowRestockModal(true);
  };

  const handleConfirmRestock = (receivedQty) => {
    if (!selectedItem) return;

    const updatedAlerts = alerts
      .map((item) => {
        if (item.id !== selectedItem.id) {
          return item;
        }

        const newStock = Math.min(item.stock + receivedQty, item.totalStock);
        const percentage = (newStock / item.totalStock) * 100;

        let status = 'In Stock';

        if (percentage <= 10) {
          status = 'Low Stock';
        } else if (percentage <= 30) {
          status = 'Medium Stock';
        }

        return {
          ...item,
          stock: newStock,
          status,
        };
      })
      .filter((item) => item.status !== 'In Stock');

    setAlerts(updatedAlerts);
    fetchInventoryAlerts();
    setRestockHistory((prev) => [
      {
        id: Date.now(),
        product: selectedItem.product,
        previousStock: selectedItem.stock,
        receivedQty,
        newStock: Math.min(selectedItem.stock + receivedQty, selectedItem.totalStock),
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setShowRestockModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-lg font-semibold">
          Inventory Alerts
        </h2>


      </div>

      <div className="space-y-5">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-green-600">🎉 All inventory items are sufficiently stocked!</h3>
            <p className="text-gray-500 mt-2">There are no inventory alerts at the moment.</p>
          </div>
        ) : (
          alerts.map((item) => {
            const progressWidth = `${Math.max(10, Math.round((item.stock / item.totalStock) * 100))}%`;
            const badgeClass = item.tone === 'red'
              ? 'bg-red-100 text-red-600'
              : 'bg-yellow-100 text-yellow-700';
            const stockClass = item.tone === 'red' ? 'text-red-500' : 'text-yellow-600';

            return (
              <div key={item.id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{item.product}</h3>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>

                  <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${badgeClass}`}>
                    {item.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Stock Remaining</span>
                    <span className={`font-medium ${stockClass}`}>{item.stock.toFixed(1)} kg</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.tone === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: progressWidth }}
                    ></div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <p className="text-sm text-gray-500">{item.message}</p>

                  <button
                    onClick={() => handleRestock(item)}
                    disabled={item.stock >= item.totalStock}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      item.stock >= item.totalStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Restock
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showRestockModal && (
        <RestockModal
          item={selectedItem}
          onClose={() => {
            setShowRestockModal(false);
            setSelectedItem(null);
          }}
          onConfirm={handleConfirmRestock}
        />
      )}

      <div className="mt-8">
        <RestockHistory history={restockHistory} />
      </div>
    </div>
  );
}