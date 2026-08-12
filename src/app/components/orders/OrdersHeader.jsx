"use client";

/**
 * OrdersHeader Component
 * Page heading section for the live orders dashboard view.
 */
export default function OrdersHeader() {
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left Heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Live Orders
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Real-time status of current active restaurant orders
          </p>
        </div>
      </div>
    </div>
  );
}