"use client";

import { useState } from "react";

export default function AddItemModal({
  onClose,
  fetchProducts,
}) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Vegetables",
    stock: 100,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: form.name,
        sku: form.sku,
        category: form.category,
        stock: form.stock,
        maxStock: 500,
        lowStockThreshold: 20,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    await fetchProducts();
    onClose();
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
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* Product */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Product
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
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
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku: e.target.value,
                })
              }
              placeholder="Enter SKU"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Stock Level: <span className="font-bold">{form.stock}</span>
            </label>

            <input
              type="range"
              min="0"
              max="500"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: Number(e.target.value),
                })
              }
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Status
            </label>
            <select className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          {/* Category */}
          <div className="col-span-2">
            <label className="block mb-2 font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
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
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}