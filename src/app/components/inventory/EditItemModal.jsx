"use client";

import { useState, useEffect } from "react";

export default function EditItemModal({
  item,
  onClose,
  onSave,
}) {
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (item) {
      setStock(item.stock);
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    onSave({
      ...item,
      stock,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-8 w-full max-w-lg">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Edit Stock
          </h2>

          <button
            onClick={onClose}
            className="text-3xl"
          >
            ×
          </button>

        </div>

        <div className="space-y-5">

          <div>

            <label className="block text-sm font-medium mb-2">
              Product
            </label>

            <input
              value={item.product}
              disabled
              className="w-full border rounded-lg px-4 py-3 bg-gray-100"
            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-2">
              Stock Level
            </label>

            <input
              type="number"
              min="0"
              max={item.totalStock}
              value={stock}
              onChange={(e) => {
                const nextValue = Number(e.target.value);
                if (Number.isNaN(nextValue)) return;
                setStock(Math.min(item.totalStock, Math.max(0, nextValue)));
              }}
              className="w-full border rounded-lg px-4 py-3"
            />

            <p className="text-sm text-gray-500 mt-2">
              Current Stock : {item.stock}
            </p>
            <p className="text-sm text-gray-500">
              Maximum Capacity : {item.totalStock}
            </p>

          </div>

          <div className="flex justify-end gap-3">

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
            >
              Save
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
