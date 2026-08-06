"use client";

import { useEffect, useState } from "react";

export default function NewOrderModal({
  onClose,
  fetchOrders,
}) {
  const [products, setProducts] = useState([]);

  const [customerName, setCustomerName] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
        alert(data.error);
        return;
      }

      await fetchOrders();

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Create New Order
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

            <label className="block mb-2 font-medium">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Product
            </label>

            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              className="w-full border rounded-lg p-3"
            >

              <option value="">
                Select Product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              className="w-full border rounded-lg p-3"
            />

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Order"}
          </button>

        </div>

      </div>

    </div>
  );
}
