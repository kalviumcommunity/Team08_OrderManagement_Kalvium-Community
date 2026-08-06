"use client";

export default function OrderHistoryTable({ orders }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Order ID</th>
            <th className="p-4 text-left">Customer</th>
            <th className="p-4 text-left">Items</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Completed</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-4">{order.id.slice(0, 8)}</td>
              <td className="p-4">{order.customerName}</td>
              <td className="p-4">
                {order.items.map((item) => (
                  <div key={item.id}>
                    {item.product.name} × {item.quantity}
                  </div>
                ))}
              </td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  COMPLETED
                </span>
              </td>
              <td className="p-4">{new Date(order.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
