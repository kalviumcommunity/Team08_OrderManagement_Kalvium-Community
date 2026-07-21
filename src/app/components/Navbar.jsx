export default function Navbar() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      {/* Search Bar */}
      <div className="w-full md:max-w-md lg:max-w-lg">
        <input
          type="text"
          placeholder="Search orders, SKUs, or customers..."
          className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-between md:justify-end gap-4">

        <button className="relative text-xl p-2 rounded-lg hover:bg-gray-100 transition">
          🔔
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
            AR
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold">Alex Rivera</p>
            <p className="text-xs text-gray-500">Ops Lead</p>
          </div>
        </div>

      </div>

    </div>
  );
}