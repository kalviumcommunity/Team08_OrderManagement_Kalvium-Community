"use client";

import { useState } from "react";

export default function AddItemModal({
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState(100);
  const [maxStock, setMaxStock] = useState(500);
  const [category, setCategory] = useState("Vegetables");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !sku.trim()) {
      alert("Product name and SKU are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          sku,
          stock: Number(stock),
          maxStock: Number(maxStock),
          lowStockThreshold: Math.max(1, Math.floor(Number(maxStock) * 0.1)),
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add product");
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Add product error:", error);
      alert("Something went wrong while adding the product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Add New Item
          </h2>

          <button
            onClick={onClose}
            className="text-3xl text-gray-500 hover:text-black"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-6"
        >
          {/* Product */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Product
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              SKU / Barcode
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter SKU"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Stock Level: <span className="font-bold">{stock}</span>
            </label>

            <input
              type="range"
              min="0"
              max={maxStock}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Maximum Stock
            </label>

            <input
              type="number"
              min="1"
              value={maxStock}
              onChange={(e) => {
                const value = Number(e.target.value);
                setMaxStock(value);

                if (stock > value) {
                  setStock(value);
                }
              }}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div className="col-span-2">
            <label className="block mb-2 font-medium text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Dairy</option>
              <option>Beverages</option>
              <option>Meat</option>
              <option>Bakery</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}