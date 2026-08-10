"use client";

import { useState } from "react";

export default function RestockModal({
  item,
  onClose,
  onSuccess,
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleRestock = async (e) => {
    e.preventDefault();

    if (quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (item.stock + quantity > item.maxStock) {
      alert(
        `You can only add up to ${item.maxStock - item.stock} more items.`
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/products/restock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: item.id,
          quantity: Number(quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to restock product");
        return;
      }

      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Restock error:", error);
      alert("Something went wrong while restocking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Restock Item</h2>

        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm">Product</p>
            <p className="font-semibold">{item.name}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Current Stock</p>
            <p>{item.stock}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Maximum Stock</p>
            <p>{item.maxStock}</p>
          </div>

          <form onSubmit={handleRestock}>
            <label className="block mb-2 font-medium">Quantity Received</label>
            <input
              type="number"
              min="1"
              max={item.maxStock - item.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={onClose} className="px-5 py-2 rounded-lg border">
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Restocking..." : "Restock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
