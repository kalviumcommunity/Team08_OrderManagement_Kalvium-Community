"use client";

import OrderColumn from "./OrderColumn";

export default function OrderBoard() {
  const newOrders = [
    {
      orderId: "ORD-8821",
      customer: "Jonathan D.",
      waitTime: "13 min",
      status: "new",
      orderType: "delivery",
      items: [
        "2 × Wagyu Burger",
        "1 × French Fries",
        "1 × Coke",
      ],
    },
    {
      orderId: "ORD-8822",
      customer: "Emma Watson",
      waitTime: "8 min",
      status: "new",
      orderType: "takeaway",
      items: [
        "1 × Margherita Pizza",
        "2 × Pepsi",
      ],
    },
  ];

  const preparingOrders = [
    {
      orderId: "ORD-8815",
      customer: "Sarah Smith",
      waitTime: "18 min",
      status: "preparing",
      orderType: "dinein",
      items: [
        "1 × Chicken Pizza",
        "2 × Garlic Bread",
      ],
    },
    {
      orderId: "ORD-8817",
      customer: "Daniel Lee",
      waitTime: "11 min",
      status: "preparing",
      orderType: "dinein",
      items: [
        "2 × Pasta Alfredo",
        "1 × Lemon Juice",
      ],
    },
  ];

  const readyOrders = [
    {
      orderId: "ORD-8808",
      customer: "Alex Brown",
      waitTime: "2 min",
      status: "ready",
      orderType: "delivery",
      items: [
        "1 × Veg Burger",
        "1 × Fries",
      ],
    },
    {
      orderId: "ORD-8809",
      customer: "Sophia Miller",
      waitTime: "1 min",
      status: "ready",
      orderType: "delivery",
      items: [
        "2 × Noodles",
        "1 × Iced Tea",
      ],
    },
  ];

  return (
    <div className="w-full">

      {/* Desktop / Tablet */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">

        <OrderColumn
          title="New Orders"
          color="bg-blue-500"
          orders={newOrders}
        />

        <OrderColumn
          title="Preparing"
          color="bg-yellow-500"
          orders={preparingOrders}
        />

        <OrderColumn
          title="Ready"
          color="bg-green-500"
          orders={readyOrders}
        />

      </div>

      {/* Mobile & Tablet */}
      <div className="flex lg:hidden flex-col gap-6">

        <OrderColumn
          title="New Orders"
          color="bg-blue-500"
          orders={newOrders}
        />

        <OrderColumn
          title="Preparing"
          color="bg-yellow-500"
          orders={preparingOrders}
        />

        <OrderColumn
          title="Ready"
          color="bg-green-500"
          orders={readyOrders}
        />

      </div>

    </div>
  );
}