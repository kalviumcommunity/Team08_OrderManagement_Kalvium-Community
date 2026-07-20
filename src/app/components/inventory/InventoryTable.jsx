"use client";

import InventoryRow from "./InventoryRow";

export default function InventoryTable() {
  const inventory = [
    {
      image: "https://picsum.photos/80?1",
      product: "Organic Cherry Tomatoes",
      subtitle: "Premium Grade A",
      sku: "TOM-CR-402",
      barcode: "4202",
      stock: 420,
      totalStock: 500,
      status: "instock",
      category: "Vegetables",
    },
    {
      image: "https://picsum.photos/80?2",
      product: "Whole Milk 1L",
      subtitle: "Pasteurized / Local Farm",
      sku: "DRY-MIL-901",
      barcode: "901",
      stock: 45,
      totalStock: 200,
      status: "lowstock",
      category: "Dairy & Eggs",
    },
    {
      image: "https://picsum.photos/80?3",
      product: "Prime Ribeye Steak",
      subtitle: "Vacuum Sealed",
      sku: "MT-RBY-884",
      barcode: "884",
      stock: 0,
      totalStock: 80,
      status: "outofstock",
      category: "Meat & Poultry",
    },
    {
      image: "https://picsum.photos/80?4",
      product: "Saffron Threads",
      subtitle: "Premium Imported",
      sku: "SP-SFR-221",
      barcode: "221",
      stock: 12,
      totalStock: 20,
      status: "instock",
      category: "Spices",
    },
  ];

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

            {inventory.map((item, index) => (
              <InventoryRow
                key={index}
                image={item.image}
                product={item.product}
                subtitle={item.subtitle}
                sku={item.sku}
                barcode={item.barcode}
                stock={item.stock}
                totalStock={item.totalStock}
                status={item.status}
                category={item.category}
              />
            ))}

          </tbody>

        </table>

      </div>


    </div>
  );
}