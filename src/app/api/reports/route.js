import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["OWNER", "MANAGER", "AUDITOR"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Stats Cards
    const newOrdersCount = await prisma.order.count({
      where: { status: "PENDING" },
    });

    const preparingCount = await prisma.order.count({
      where: { status: "PREPARING" },
    });

    const readyCount = await prisma.order.count({
      where: { status: "READY" },
    });

    const lowStockCount = await prisma.product.count({
      where: {
        stock: {
          lt: 5, // Default low stock threshold
        },
      },
    });

    // Compute dynamic revenue based on all order items
    // Since there's no price in database, we assume a base item value of $15
    const orderItems = await prisma.orderItem.findMany();
    const totalRevenue = orderItems.reduce((acc, item) => acc + item.quantity * 15, 0);

    // 2. Active Orders
    const activeOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "PREPARING", "READY"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 3. Daily Order Volume (past 7 days)
    const today = new Date();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyVolume = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const count = await prisma.order.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      dailyVolume.push({
        day: daysOfWeek[d.getDay()],
        count,
      });
    }

    // Weekly summary
    const startOfThisWeek = new Date();
    startOfThisWeek.setDate(today.getDate() - 7);
    const thisWeekCount = await prisma.order.count({
      where: {
        createdAt: { gte: startOfThisWeek },
      },
    });

    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(today.getDate() - 14);
    const lastWeekCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfLastWeek,
          lt: startOfThisWeek,
        },
      },
    });

    let growth = 0;
    if (lastWeekCount > 0) {
      growth = parseFloat((((thisWeekCount - lastWeekCount) / lastWeekCount) * 100).toFixed(1));
    } else if (thisWeekCount > 0) {
      growth = 100; // default to 100% if last week had 0 orders
    }

    // 4. Inventory Alerts
    // Find products where stock is below the threshold
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 5,
        },
      },
    });

    const alerts = lowStockProducts.map((p) => {
      let status = "Low Stock";
      let tone = "red";
      let message = "Reorder immediately to avoid shortages.";

      if (p.stock >= 3) {
        status = "Medium Stock";
        tone = "yellow";
        message = "Plan restocking within the next delivery cycle.";
      }

      return {
        id: p.id,
        product: p.name,
        sku: `SKU-${p.id.slice(0, 4).toUpperCase()}`,
        stock: p.stock,
        totalStock: 20, // assumption for capacity
        status,
        message,
        tone,
      };
    });

    return NextResponse.json(
      {
        stats: {
          newOrdersCount,
          preparingCount,
          readyCount,
          revenue: totalRevenue,
          lowStockCount,
        },
        activeOrders,
        dailyVolume,
        weeklySummary: {
          total: thisWeekCount,
          growth,
        },
        alerts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
