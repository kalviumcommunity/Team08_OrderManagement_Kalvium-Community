export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";

/**
 * GET /api/reports
 * Aggregates high-level business reports and dashboard analytics:
 * 1. Order Status Counts (PENDING, PREPARING, READY)
 * 2. Total Estimated Revenue
 * 3. Active Orders listing with item relations
 * 4. 7-day Historical Order Volume breakdown
 * 5. Week-over-week order growth percentage
 * 6. Actionable Low Stock Inventory Alerts
 * 
 * Restricted to OWNER, MANAGER, and AUDITOR roles.
 */
export async function GET(req) {
  try {
    // 1. Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate role authorization
    const allowedRoles = ["OWNER", "MANAGER", "AUDITOR"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Compute KPI Counts
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

    // Compute dynamic revenue based on all order items (assuming nominal $15/item)
    const orderItems = await prisma.orderItem.findMany();
    const totalRevenue = orderItems.reduce((acc, item) => acc + item.quantity * 15, 0);

    // 4. Fetch Active Orders (Pending, Preparing, Ready)
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

    // 5. Compute Daily Order Volume over the past 7 days
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

    // 6. Calculate Week-over-Week Growth
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
      growth = 100; // Default to 100% if prior week was zero
    }

    // 7. Generate Low-Stock Inventory Alerts
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
        totalStock: 20, // Estimated storage capacity
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
