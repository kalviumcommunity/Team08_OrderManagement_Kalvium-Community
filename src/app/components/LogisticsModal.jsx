"use client";

/**
 * LogisticsModal Component
 * Informational dialog presenting upcoming delivery tracking features:
 * Live driver GPS location, automated route optimization, ETA prediction, and delivery analytics.
 * 
 * @param {Function} onClose - Callback to dismiss the modal dialog
 */
export default function LogisticsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {/* Modal Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Logistics Hub
          </h2>

          <p className="text-gray-500 mt-3">
            Live Delivery Tracking will be available in a future release.
          </p>
        </div>

        {/* Feature List */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 border rounded-lg p-4">
            <div>
              <p className="font-semibold">
                Live Driver Locations
              </p>

              <p className="text-sm text-gray-500">
                Track every delivery partner in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-4">
            <div>
              <p className="font-semibold">
                Route Optimization
              </p>

              <p className="text-sm text-gray-500">
                View the fastest delivery routes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-4">
            <div>
              <p className="font-semibold">
                ETA Prediction
              </p>

              <p className="text-sm text-gray-500">
                Estimate customer delivery times.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border rounded-lg p-4">
            <div>
              <p className="font-semibold">
                Delivery Analytics
              </p>

              <p className="text-sm text-gray-500">
                Monitor delivery performance and trends.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
