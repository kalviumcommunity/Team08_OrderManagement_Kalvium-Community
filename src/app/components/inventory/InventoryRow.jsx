"use client";

import { Pencil, Trash2 } from "lucide-react";

/**
 * InventoryRow Component
 * Renders a single row in the inventory table with stock meters, category,
 * status badge, and edit/delete actions.
 * 
 * @param {object} item - The product item record
 * @param {Function} onEdit - Callback to edit item
 * @param {Function} onDelete - Callback to delete item
 */
export default function InventoryRow({
  item,
  onEdit,
  onDelete,
}) {
  const {
    name,
    description,
    sku,
    barcode,
    stock,
    maxStock,
    category,
  } = item;

  // Calculate percentage of storage capacity filled
  const percentage = Math.min(
    Math.round((stock / maxStock) * 100),
    100
  );

  // Determine stock health state
  let status = "instock";

  if (stock === 0) {
    status = "outofstock";
  } else if (stock <= item.lowStockThreshold) {
    status = "lowstock";
  }

  // Styling maps
  const statusStyle = {
    instock: "bg-green-100 text-green-700",
    lowstock: "bg-orange-100 text-orange-700",
    outofstock: "bg-red-100 text-red-700",
  };

  const statusText = {
    instock: "IN STOCK",
    lowstock: "LOW STOCK",
    outofstock: "OUT OF STOCK",
  };

  const progressColor = {
    instock: "bg-green-500",
    lowstock: "bg-orange-500",
    outofstock: "bg-red-500",
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      {/* Checkbox */}
      <td className="px-4 py-4">
        <input type="checkbox" />
      </td>

      {/* Product Details */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800">
              {name}
            </p>

            <p className="text-xs text-gray-500">
              {description || "No description"}
            </p>
          </div>
        </div>
      </td>

      {/* SKU & Barcode */}
      <td className="px-4 py-4">
        <p className="text-sm font-medium">
          {sku}
        </p>

        <p className="text-xs text-gray-500">
          {barcode}
        </p>
      </td>

      {/* Stock Level with Capacity Bar */}
      <td className="px-4 py-4">
        <p className="text-sm font-medium mb-2">
          {stock} / {maxStock}
        </p>

        <div className="w-28 h-2 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full ${progressColor[status]}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </td>

      {/* Stock Status Badge */}
      <td className="px-4 py-4">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[status]}`}
        >
          {statusText[status]}
        </span>
      </td>

      {/* Product Category */}
      <td className="px-4 py-4 text-sm">
        {category}
      </td>

      {/* Row Action Buttons */}
      <td className="px-4 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(item)}
            className="text-gray-500 hover:text-indigo-600 transition"
            title="Edit Stock"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => onDelete(item)}
            className="text-gray-500 hover:text-red-600 transition"
            title="Delete Product"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}