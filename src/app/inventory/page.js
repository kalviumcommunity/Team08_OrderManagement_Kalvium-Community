import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import InventoryHeader from "../components/inventory/InventoryHeader";
import InventoryStats from "../components/inventory/InventoryStats";
import CategoryFilter from "../components/inventory/CategoryFilter";
import InventoryTable from "../components/inventory/InventoryTable";
import Pagination from "../components/inventory/Pagination";
import BottomStatusBar from "../components/inventory/BottomStatusBar";

export default function InventoryPage() {
  return (
    <div className="mt-6 bg-white rounded-2xl border shadow-sm overflow-hidden">


      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">

          <div className="p-4 sm:p-6 lg:p-8">

            {/* Navbar */}
            <Navbar />

            {/* Header */}
            <div className="mt-6">
              <InventoryHeader />
            </div>

            {/* Statistics */}
            <div className="mt-6">
              <InventoryStats />
            </div>

            {/* Filters */}
            <div className="mt-6">
              <CategoryFilter />
            </div>

            {/* Inventory Table */}
            <div className="mt-6">
              <InventoryTable />
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination />
            </div>

          </div>

        </main>

      </div>

      {/* Bottom Status */}
      <BottomStatusBar />

    </div>
  );
}