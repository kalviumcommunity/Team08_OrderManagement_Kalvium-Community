export default function InventoryAlerts() {
  return (
    <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-lg font-semibold">
          Inventory Alerts
        </h2>

        <button className="text-sm text-indigo-600 hover:underline">
          View All
        </button>

      </div>

      <div className="space-y-5">

        {/* Item 1 */}
        <div className="border rounded-xl p-4 hover:shadow-md transition">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

            <div>

              <h3 className="font-semibold text-lg">
                Premium Wagyu Beef
              </h3>

              <p className="text-sm text-gray-500">
                SKU: WYB-100
              </p>

            </div>

            <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full w-fit">
              Low Stock
            </span>

          </div>

          <div className="mt-4">

            <div className="flex justify-between text-sm mb-2">

              <span>Stock Remaining</span>

              <span className="font-medium text-red-500">
                2.4 kg
              </span>

            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

              <div className="w-[20%] h-full bg-red-500 rounded-full"></div>

            </div>

          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

            <p className="text-sm text-gray-500">
              Reorder immediately to avoid shortages.
            </p>

            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition">
              Restock
            </button>

          </div>

        </div>

        {/* Item 2 */}
        <div className="border rounded-xl p-4 hover:shadow-md transition">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

            <div>

              <h3 className="font-semibold text-lg">
                Fresh Mozzarella
              </h3>

              <p className="text-sm text-gray-500">
                SKU: CHE-201
              </p>

            </div>

            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full w-fit">
              Medium Stock
            </span>

          </div>

          <div className="mt-4">

            <div className="flex justify-between text-sm mb-2">

              <span>Stock Remaining</span>

              <span className="font-medium text-yellow-600">
                5.0 kg
              </span>

            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

              <div className="w-[45%] h-full bg-yellow-500 rounded-full"></div>

            </div>

          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

            <p className="text-sm text-gray-500">
              Plan restocking within the next delivery cycle.
            </p>

            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition">
              Restock
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}