/**
 * RestockHistory Component
 * Table displaying recent restock shipments and stock adjustment events.
 * Shows previous inventory, incoming received quantity, new total stock, and timestamp.
 * 
 * @param {Array} history - Array of restock history records
 */
export default function RestockHistory({ history = [] }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Title */}
      <h2 className="text-xl font-bold mb-5">Restock History</h2>

      {/* History Table */}
      <table className="w-full">
        <thead>
          <tr className="text-left border-b text-gray-500 text-xs uppercase">
            <th className="py-2">Product</th>
            <th className="py-2">Previous</th>
            <th className="py-2">Received</th>
            <th className="py-2">New Stock</th>
            <th className="py-2">Date</th>
          </tr>
        </thead>

        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center text-gray-400 text-sm">
                No recent restock activity recorded.
              </td>
            </tr>
          ) : (
            history.map((item) => (
              <tr key={item.id} className="border-b text-sm">
                <td className="py-3 font-medium">{item.product}</td>
                <td className="py-3 text-gray-600">{item.previousStock}</td>
                <td className="py-3 text-green-600 font-semibold">+{item.receivedQty}</td>
                <td className="py-3 font-medium">{item.newStock}</td>
                <td className="py-3 text-gray-500">{item.date}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
