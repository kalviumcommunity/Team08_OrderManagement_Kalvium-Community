import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { broadcastSSE } from "@/lib/sse";
import { cancelOrder } from "@/lib/services/order-service";

/**
 * PATCH /api/orders/[id]
 * Updates the state of an existing order.
 * Supports:
 * 1. Cancellation (status: "CANCELLED") - refunds inventory stock and emits events
 * 2. Sequential Status Progression (PENDING -> PREPARING -> READY -> COMPLETED)
 */
export async function PATCH(req, { params }) {
  try {
    // 1. Authenticate requesting user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const nextStatus = status.toUpperCase();
    const isCancellation = nextStatus === "CANCELLED";

    // 2. Authorization check
    // Sequential status progress is restricted to OWNER and MANAGER.
    // Order cancellation is permitted for OWNER, MANAGER, or CUSTOMER (validated in service).
    const allowedRoles = isCancellation
      ? ["OWNER", "MANAGER", "CUSTOMER"]
      : ["OWNER", "MANAGER"];

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Process Cancellation
    if (isCancellation) {
      const result = await cancelOrder(id, user.id, user.role);

      // Broadcast order update to live clients
      broadcastSSE("ORDER_UPDATED", result.order);

      // Broadcast stock restoration for refunded items
      for (const log of result.logs) {
        broadcastSSE("STOCK_UPDATED", {
          productId: log.productId,
          stock: log.product.stock,
          log: log,
        });
      }

      return NextResponse.json(
        {
          message: "Order cancelled successfully and stock refunded",
          order: result.order,
        },
        { status: 200 }
      );
    }

    // 4. Process Sequential Status Transitions (PENDING -> PREPARING -> READY -> COMPLETED)
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = order.status.toUpperCase();

    // Enforce strict linear progression
    let isValidTransition = false;
    if (currentStatus === "PENDING" && nextStatus === "PREPARING") {
      isValidTransition = true;
    } else if (currentStatus === "PREPARING" && nextStatus === "READY") {
      isValidTransition = true;
    } else if (currentStatus === "READY" && nextStatus === "COMPLETED") {
      isValidTransition = true;
    }

    if (!isValidTransition) {
      return NextResponse.json(
        {
          error: `Invalid state transition from ${currentStatus} to ${nextStatus}. Sequential flow must be followed: PENDING -> PREPARING -> READY -> COMPLETED`,
        },
        { status: 400 }
      );
    }

    // 5. Update database record
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 6. Broadcast SSE update
    broadcastSSE("ORDER_UPDATED", updatedOrder);

    return NextResponse.json(
      { message: `Order status updated to ${nextStatus}`, order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH order status error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 400 }
    );
  }
}
