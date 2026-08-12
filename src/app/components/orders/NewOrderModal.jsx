"use client";

import { useEffect, useState } from "react";

/**
 * NewOrderModal Component
 * Dialog modal allowing restaurant staff to manually create new walk-in / pickup orders.
 * Fetches available products from /api/products, validates stock, and submits order.
 * 
 * @param {Function} onClose - Callback to close modal
 * @param {Function} fetchOrders - Callback to refresh active orders list on parent view
 */
export default function NewOrderModal({
  onClose,
  fetchOrders,
}) {
  // State for products list and form values
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch product catalog on modal mount
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Fetches available products for order item selection
   */
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to load products for order:", error);
    }
  };

  /**
   * Submits the new order payload to POST /api/orders
   */
  const handleSubmit = async () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          customerName,
          items: [
            {
              productId: selectedProduct,
              quantity,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create order");
        return;
      }

      // Re-fetch parent orders list and dismiss modal
      await fetchOrders();
      onClose();
    } catch (error) {
      console.error("Order creation error:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Create New Order
          </h2>

          <button
            onClick={onClose}
            className="text-3xl text-gray-500 hover:text-black"
          >
            &times;
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-5">
          {/* Customer Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Customer Name
            </label>

            <input
              type="text"
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Product Selection */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Product
            </label>

            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">
                Select Product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
