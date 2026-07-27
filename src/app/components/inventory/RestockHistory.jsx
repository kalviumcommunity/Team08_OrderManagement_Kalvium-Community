export default function RestockHistory({ history }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">Restock History</h2>

      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th>Product</th>
            <th>Previous</th>
            <th>Received</th>
            <th>New Stock</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="border-b">
              <td>{item.product}</td>
              <td>{item.previousStock}</td>
              <td>+{item.receivedQty}</td>
              <td>{item.newStock}</td>
              <td>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
