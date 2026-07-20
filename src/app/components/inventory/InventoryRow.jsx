"use client";

import { Pencil, Trash2 } from "lucide-react";

export default function InventoryRow({
  image,
  product,
  subtitle,
  sku,
  barcode,
  stock,
  totalStock,
  status,
  category,
}) {
  const percentage = Math.min(
    Math.round((stock / totalStock) * 100),
    100
  );

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

      {/* Product */}
      <td className="px-4 py-4">

        <div className="flex items-center gap-3">

          <img
            src={image}
            alt={product}
            className="w-14 h-14 rounded-lg object-cover border"
          />

          <div>

            <p className="font-semibold text-gray-800">
              {product}
            </p>

            <p className="text-xs text-gray-500">
              {subtitle}
            </p>

          </div>

        </div>

      </td>

      {/* SKU */}
      <td className="px-4 py-4">

        <p className="text-sm font-medium">
          {sku}
        </p>

        <p className="text-xs text-gray-500">
          {barcode}
        </p>

      </td>

      {/* Stock */}
      <td className="px-4 py-4">

        <p className="text-sm font-medium mb-2">
          {stock} / {totalStock}
        </p>

        <div className="w-28 h-2 bg-gray-200 rounded-full">

          <div
            className={`h-full rounded-full ${progressColor[status]}`}
            style={{ width: `${percentage}%` }}
          ></div>

        </div>

      </td>

      {/* Status */}
      <td className="px-4 py-4">

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[status]}`}
        >
          {statusText[status]}
        </span>

      </td>

      {/* Category */}
      <td className="px-4 py-4 text-sm">
        {category}
      </td>

      {/* Actions */}
      <td className="px-4 py-4">

        <div className="flex gap-3">

          <button className="text-gray-500 hover:text-indigo-600 transition">
            <Pencil size={18} />
          </button>

          <button className="text-gray-500 hover:text-red-600 transition">
            <Trash2 size={18} />
          </button>

        </div>

      </td>

    </tr>
  );
}