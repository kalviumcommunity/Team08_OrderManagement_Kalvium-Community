import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          status: "PREPARING",
        },
      }),

      prisma.order.count({
        where: {
          status: "READY",
        },
      }),

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
