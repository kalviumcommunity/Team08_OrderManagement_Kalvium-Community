import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import ActiveOrders from "../components/ActiveOrders";
import OrderVolume from "../components/OrderVolume";
import InventoryAlerts from "../components/InventoryAlerts";
import LogisticsHub from "../components/LogisticsHub";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">

          <div className="p-4 sm:p-6 lg:p-8">

            {/* Navbar */}
            <Navbar />

            {/* Stats */}
            <StatsCards />

            {/* Orders + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

              <ActiveOrders />

              <OrderVolume />

            </div>

            {/* Inventory + Logistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

              <InventoryAlerts />

              <LogisticsHub />

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}