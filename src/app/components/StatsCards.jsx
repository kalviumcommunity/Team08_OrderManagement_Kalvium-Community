export default function StatsCards({ stats }) {
  const newOrders = stats?.newOrdersCount ?? 0;
  const preparing = stats?.preparingCount ?? 0;
  const ready = stats?.readyCount ?? 0;
  const revenue = stats?.revenue ? `$${(stats.revenue / 1000).toFixed(1)}K` : "$0.0K";
  const lowStock = stats?.lowStockCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mt-8 text-gray-900">

      {/* New Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          New Orders
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {newOrders}
        </h2>

        <p className="text-green-500 text-sm mt-3">
          +12% vs last hour
        </p>
      </div>

      {/* Preparing */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Preparing
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {preparing}
        </h2>

        <p className="text-gray-500 text-sm mt-3">
          Average: 18 min
        </p>
      </div>

      {/* Ready */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Ready
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {ready}
        </h2>

        <p className="text-gray-500 text-sm mt-3">
          Waiting pickup
        </p>
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Revenue
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3">
          {revenue}
        </h2>

        <p className="text-green-500 text-sm mt-3">
          +4.5%
        </p>
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Low Stock
        </p>

        <h2 className="text-3xl lg:text-4xl font-bold mt-3 text-red-600">
          {lowStock < 10 ? `0${lowStock}` : lowStock}
        </h2>

        <p className="text-red-500 text-sm mt-3">
          Restock needed
        </p>
      </div>

    </div>
  );
}