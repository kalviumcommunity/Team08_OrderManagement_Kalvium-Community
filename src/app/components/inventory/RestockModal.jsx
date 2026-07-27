"use client";

import { useState, useEffect } from "react";

export default function RestockModal({
  item,
  onClose,
  onConfirm,
}) {
  const [receivedQty, setReceivedQty] = useState("");

  useEffect(() => {
    setReceivedQty("");
  }, [item]);

  if (!item) return null;

  const neededQty = item.totalStock - item.stock;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Restock Item</h2>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm">Product</p>
            <p className="font-semibold">{item.product}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Current Stock</p>
            <p>{item.stock}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Maximum Stock</p>
            <p>{item.totalStock}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Need to Restock</p>
            <p className="text-red-500 font-semibold">{neededQty}</p>
          </div>

          <div>
            <label className="block mb-2 font-medium">Quantity Received</label>
            <input
              type="number"
              min="0"
              max={neededQty}
              value={receivedQty}
              onChange={(e) => setReceivedQty(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border">
            Cancel
          </button>

          <button
            onClick={() => onConfirm(Number(receivedQty))}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
          >
            Confirm Restock
          </button>
        </div>
      </div>
    </div>
  );
}
