"use client";

import InventoryRow from "./InventoryRow";

/**
 * InventoryTable Component
 * Renders the master product table header and rows for each inventory item.
 * 
 * @param {Array} inventory - List of formatted product records
 * @param {Function} onEdit - Callback when clicking the edit button on a row
 * @param {Function} onDelete - Callback when clicking the delete button on a row
 */
export default function InventoryTable({
  inventory,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full">
          {/* Table Header */}
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

          {/* Table Body */}
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