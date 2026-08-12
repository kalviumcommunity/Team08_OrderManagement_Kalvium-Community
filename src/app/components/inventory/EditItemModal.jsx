"use client";

import { useState, useEffect } from "react";

/**
 * EditItemModal Component
 * Dialog modal allowing managers/owners to adjust the on-hand stock quantity for a product.
 * Dynamically computes stock health badge based on thresholds.
 * 
 * @param {object} item - Product item to edit
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSave - Callback invoked with modified product data
 */
export default function EditItemModal({
  item,
  onClose,
  onSave,
}) {
  const [stock, setStock] = useState(0);

  // Sync internal state when item prop updates
  useEffect(() => {
    if (item) {
      setStock(item.stock);
    }
  }, [item]);

  if (!item) return null;

  /**
   * Save modified stock quantity
   */
  const handleSave = () => {
    onSave({
      ...item,
      stock,
    });
  };

  // Determine human-readable stock status
  let status = "In Stock";
  if (stock === 0) {
    status = "Out of Stock";
  } else if (stock <= item.lowStockThreshold) {
    status = "Low Stock";
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Edit Stock
          </h2>

          <button
            onClick={onClose}
            className="text-3xl"
          >
            &times;
          </button>
        </div>

        {/* Edit Form */}
        <div className="space-y-5">
          {/* Readonly Product Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product
            </label>

            <input
              value={item.name}
              disabled
              className="w-full border rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* New Stock Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Stock Level
            </label>

            <input
              type="number"
              min="0"
              max={item.maxStock}
              value={stock}
              onChange={(e) => {
                const nextValue = Number(e.target.value);
                if (Number.isNaN(nextValue)) return;
                setStock(Math.min(item.maxStock, Math.max(0, nextValue)));
              }}
              className="w-full border rounded-lg px-4 py-3"
            />

            {/* Context Info */}
            <p className="text-sm text-gray-500 mt-2">
              Current Stock : {item.stock}
            </p>
            <p className="text-sm text-gray-500">
              Maximum Capacity : {item.maxStock}
            </p>
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span className="font-medium text-gray-700">
                {status}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
