"use client";

/**
 * OrderHistoryTable Component
 * Table displaying completed historical orders with customer details, line items,
 * status badge, and completion timestamp.
 * 
 * @param {Array} orders - List of completed orders
 */
export default function OrderHistoryTable({ orders = [] }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Order ID</th>
            <th className="p-4 text-left">Customer</th>
            <th className="p-4 text-left">Items</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Completed</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-gray-500">
                No completed orders found in history.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 font-mono text-sm text-gray-600">#{order.id.slice(0, 8)}</td>
                <td className="p-4 font-medium">{order.customerName}</td>
                <td className="p-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      {item.product?.name || "Product"} × {item.quantity}
                    </div>
                  ))}
                </td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    COMPLETED
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(order.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
