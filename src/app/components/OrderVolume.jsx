export default function OrderVolume({ volume = [], summary }) {
  const weeklyTotal = summary?.total ?? 0;
  const growth = summary?.growth ?? 0;

  // Find max count to scale heights
  const maxCount = volume.length > 0 ? Math.max(...volume.map((v) => v.count)) : 0;

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

        {volume.length === 0 ? (
          <div className="w-full flex items-center justify-center text-gray-500 text-sm">
            No volume data.
          </div>
        ) : (
          volume.map((item, index) => {
            // Scale bar height dynamically between 10% and 90%
            const heightPercent = maxCount > 0 ? (item.count / maxCount) * 80 + 10 : 10;
            
            // Choose background shades of indigo dynamically
            const bgClass =
              index === volume.length - 1
                ? "bg-indigo-600"
                : index % 2 === 0
                ? "bg-indigo-200"
                : "bg-indigo-300";

            return (
              <div key={item.day} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full max-w-8 rounded-t transition-all duration-500 ${bgClass}`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${item.count} orders`}
                ></div>
                <span className="mt-2 text-xs text-gray-500">{item.day}</span>
              </div>
            );
          })
        )}

      </div>

      {/* Footer */}
      <div className="mt-6 border-t pt-4 flex justify-between items-center">

        <div>
          <p className="text-xs text-gray-500">
            Weekly Orders
          </p>

          <p className="text-xl font-bold">
            {weeklyTotal}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">
            Growth
          </p>

          <p className={`font-semibold ${growth >= 0 ? "text-green-500" : "text-red-500"}`}>
            {growth >= 0 ? `+${growth}%` : `${growth}%`}
          </p>
        </div>

      </div>

    </div>
  );
}