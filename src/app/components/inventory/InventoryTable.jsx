"use client";

import InventoryRow from "./InventoryRow";

export default function InventoryTable({
  inventory,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

      {/* Responsive Table */}
      <div className="overflow-x-auto">

        <table className="min-w-[1100px] w-full">

          {/* Header */}
          <thead className="bg-gray-50">

            <tr className="text-left text-xs uppercase text-gray-500">

              <th className="px-4 py-4">
                <input type="checkbox" />
              </th>

              <th className="px-4 py-4">
                Product
              </th>

              <th className="px-4 py-4">
                SKU / Barcode
              </th>

              <th className="px-4 py-4">
                Stock Level
              </th>

              <th className="px-4 py-4">
                Status
              </th>

              <th className="px-4 py-4">
                Category
              </th>

              <th className="px-4 py-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          {/* Body */}
          <tbody>

            {inventory.map((item) => (
              <InventoryRow
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

          </tbody>

        </table>

      </div>


    </div>
  );
}