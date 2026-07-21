import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import OrdersHeader from "../components/orders/OrdersHeader";

import OrderBoard from "../components/orders/OrderBoard";


export default function OrdersPage() {
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

            {/* Page Header */}
            <div className="mt-6">
              <OrdersHeader />
            </div>


            {/* Order Board */}
            <div className="mt-6">
              <OrderBoard />
            </div>

          </div>

        </main>

      </div>


    </div>
  );
}