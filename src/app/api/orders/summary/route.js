import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/orders/summary
 * Returns order count metrics aggregated by status for quick dashboard overviews:
 * - pendingOrders: Count of orders waiting for kitchen preparation
 * - preparingOrders: Count of orders currently being prepared
 * - readyOrders: Count of orders ready for pickup/delivery
 * - completedToday: Count of orders completed since the start of today
 */
export async function GET() {
  try {
    const [
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday,
    ] = await Promise.all([
      // Count pending orders
      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      // Count preparing orders
      prisma.order.count({
        where: {
          status: "PREPARING",
        },
      }),

      // Count ready orders
      prisma.order.count({
        where: {
          status: "READY",
        },
      }),

      // Count orders completed today (since 00:00:00)
      prisma.order.count({
        where: {
          status: "COMPLETED",
          updatedAt: {
            gte: new Date(
              new Date().setHours(0, 0, 0, 0)
            ),
          },
        },
      }),
    ]);

    return NextResponse.json({
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday,
    });
  } catch (error) {
    console.error("Order summary error:", error);

    return NextResponse.json(
      { error: "Failed to fetch order summary" },
      { status: 500 }
    );
  }
}
