export default function ActiveOrders({ orders = [] }) {
  return (
    <div className="col-span-1 lg:col-span-2 bg-white border rounded-xl shadow-sm p-5 text-gray-900">

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

            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No active orders at the moment.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const orderAmount = order.items.reduce((sum, item) => sum + item.quantity * 15, 0);
                const itemsList = order.items
                  .map((item) => `${item.product?.name || "Product"} ×${item.quantity}`)
                  .join(", ");
                
                // Color mapping for badge
                let badgeClass = "bg-blue-100 text-blue-700";
                if (order.status === "PREPARING") {
                  badgeClass = "bg-yellow-100 text-yellow-700";
                } else if (order.status === "READY") {
                  badgeClass = "bg-green-100 text-green-700";
                }

                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition">

                    <td className="py-4 font-medium text-xs text-gray-600">
                      #{order.id.slice(0, 8)}...
                    </td>

                    <td className="font-medium">{order.customerName}</td>

                    <td className="text-sm text-gray-600 max-w-[250px] truncate" title={itemsList}>
                      {itemsList}
                    </td>

                    <td>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </span>
                    </td>

                    <td className="text-right font-medium">
                      ${orderAmount.toFixed(2)}
                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}