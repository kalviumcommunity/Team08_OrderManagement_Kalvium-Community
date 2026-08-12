"use client";

import { useState } from 'react';
import RestockModal from '@/app/components/inventory/RestockModal';
import RestockHistory from '@/app/components/inventory/RestockHistory';

/**
 * InventoryAlerts Component
 * Renders products that have dropped below their low-stock threshold.
 * Provides a progress bar visualization of remaining capacity and a quick Restock button.
 * 
 * @param {Array} products - List of catalog products
 * @param {Function} onRestockSuccess - Callback triggered after successfully restocking
 */
export default function InventoryAlerts({ products = [], onRestockSuccess }) {
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockHistory] = useState([]);

  // Filter products below their individual low stock threshold
  const alerts = products.filter(
    (product) => product.stock < product.lowStockThreshold
  );

  /**
   * Opens the restock modal for the chosen low-stock product
   */
  const handleRestock = (item) => {
    setSelectedItem(item);
    setShowRestockModal(true);
  };

  return (
    <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border shadow-sm p-5 text-gray-900">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          Inventory Alerts
        </h2>
      </div>

      {/* Alerts List */}
      <div className="space-y-5">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-green-600">🎉 All inventory items are sufficiently stocked!</h3>
            <p className="text-gray-500 mt-2">There are no inventory alerts at the moment.</p>
          </div>
        ) : (
          alerts.map((item) => {
            // Visual calculation for stock progress bar
            const totalStock = item.maxStock || item.totalStock || 20;
            const progressWidth = `${Math.max(10, Math.round((item.stock / totalStock) * 100))}%`;
            const isCritical = item.stock === 0 || item.tone === 'red';
            const badgeClass = isCritical
              ? 'bg-red-100 text-red-600'
              : 'bg-yellow-100 text-yellow-700';
            const stockClass = isCritical ? 'text-red-500' : 'text-yellow-600';

            return (
              <div key={item.id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">Product ID: {item.id.slice(0, 8)}</p>
                  </div>

                  <span className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${badgeClass}`}>
                    {item.stock === 0 ? "Out of Stock" : "Low Stock"}
                  </span>
                </div>

                {/* Remaining Stock Meter */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Stock Remaining</span>
                    <span className={`font-medium ${stockClass}`}>{item.stock}</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: progressWidth }}
                    ></div>
                  </div>
                </div>

                {/* Restock Action Area */}
                <div className="mt-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <p className="text-sm text-gray-500">Low stock threshold: {item.lowStockThreshold}</p>

                  <button
                    onClick={() => handleRestock(item)}
                    disabled={item.stock >= (item.lowStockThreshold * 2)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      item.stock >= (item.lowStockThreshold * 2)
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

      {/* Restock Dialog Modal */}
      {showRestockModal && (
        <RestockModal
          item={selectedItem}
          onClose={() => {
            setShowRestockModal(false);
            setSelectedItem(null);
          }}
          onSuccess={async () => {
            await onRestockSuccess?.();
          }}
        />
      )}

      {/* Restock History Logs */}
      <div className="mt-8">
        <RestockHistory history={restockHistory} />
      </div>
    </div>
  );
}