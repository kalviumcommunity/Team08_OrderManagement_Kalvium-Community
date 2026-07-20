export default function ActiveOrders() {
  return (
    <div className="col-span-1 lg:col-span-2 bg-white border rounded-xl shadow-sm p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">

        <h2 className="text-lg font-semibold">
          Active Orders
        </h2>

        <div className="flex gap-3">

          <button className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition">
            Filter
          </button>

          <button className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition">
            Export
          </button>

        </div>

      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">

        <table className="min-w-[700px] w-full">

          <thead>

            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">

              <th className="py-3">Order ID</th>

              <th>Customer</th>

              <th>Items</th>

              <th>Status</th>

              <th className="text-right">Amount</th>

            </tr>

          </thead>

          <tbody>

            <tr className="border-b hover:bg-gray-50 transition">

              <td className="py-4 font-medium">
                #1001
              </td>

              <td>John Doe</td>

              <td>Pizza ×2</td>

              <td>
                <span className="bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs">
                  Preparing
                </span>
              </td>

              <td className="text-right font-medium">
                $45.50
              </td>

            </tr>

            <tr className="border-b hover:bg-gray-50 transition">

              <td className="py-4 font-medium">
                #1002
              </td>

              <td>Sarah Smith</td>

              <td>Burger ×1</td>

              <td>
                <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs">
                  Ready
                </span>
              </td>

              <td className="text-right font-medium">
                $22.00
              </td>

            </tr>

            <tr className="hover:bg-gray-50 transition">

              <td className="py-4 font-medium">
                #1003
              </td>

              <td>Alex Lee</td>

              <td>Pasta ×1</td>

              <td>
                <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs">
                  New
                </span>
              </td>

              <td className="text-right font-medium">
                $18.75
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}