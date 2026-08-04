export default function OrderVolume({ orders = [] }) {
  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const orderCounts = Array(7).fill(0);

  orders.forEach((order) => {
    const day = new Date(order.createdAt).getDay();
    orderCounts[day]++;
  });

  const maxOrders = Math.max(...orderCounts, 1);

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 text-gray-900">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-lg font-semibold">
          Daily Order Volume
        </h2>

        <button className="text-sm text-indigo-600 hover:underline">
          View Report
        </button>

      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-56 gap-2">
        {weekDays.map((day, index) => {
          const height = (orderCounts[index] / maxOrders) * 180;

          return (
            <div key={day} className="flex flex-col items-center flex-1">
              <div
                className="w-full max-w-8 rounded-t bg-indigo-500"
                style={{
                  height: `${height}px`,
                  minHeight: "8px",
                }}
              />

              <span className="mt-2 text-xs text-gray-500">{day}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 border-t pt-4 flex justify-between items-center">

        <div>
          <p className="text-xs text-gray-500">
            Weekly Orders
          </p>

          <p className="text-xl font-bold">
            {orders.length}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">
            Growth
          </p>

          <p className="font-semibold text-gray-600">
            Live Data
          </p>
        </div>

      </div>

    </div>
  );
}