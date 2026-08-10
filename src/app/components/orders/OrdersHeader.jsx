"use client";

export default function OrdersHeader() {
  return (
    <div className="w-full">

      {/* Top Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        {/* Left */}
        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Live Orders
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Real-time status of 18 active orders
          </p>

        </div>

      </div>

    </div>
  );
}