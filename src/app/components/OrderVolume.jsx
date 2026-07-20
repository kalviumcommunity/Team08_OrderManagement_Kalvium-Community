export default function OrderVolume() {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">

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

        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-8 h-20 rounded-t bg-indigo-100"></div>
          <span className="mt-2 text-xs text-gray-500">Mon</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-8 h-28 rounded-t bg-indigo-200"></div>
          <span className="mt-2 text-xs text-gray-500">Tue</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-8 h-24 rounded-t bg-indigo-300"></div>
          <span className="mt-2 text-xs text-gray-500">Wed</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-8 h-44 rounded-t bg-indigo-600"></div>
          <span className="mt-2 text-xs text-gray-500">Thu</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-8 h-32 rounded-t bg-indigo-400"></div>
          <span className="mt-2 text-xs text-gray-500">Fri</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-8 h-24 rounded-t bg-indigo-200"></div>
          <span className="mt-2 text-xs text-gray-500">Sat</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-full max-w-8 h-16 rounded-t bg-indigo-100"></div>
          <span className="mt-2 text-xs text-gray-500">Sun</span>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 border-t pt-4 flex justify-between items-center">

        <div>
          <p className="text-xs text-gray-500">
            Weekly Orders
          </p>

          <p className="text-xl font-bold">
            845
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">
            Growth
          </p>

          <p className="text-green-500 font-semibold">
            +18.5%
          </p>
        </div>

      </div>

    </div>
  );
}