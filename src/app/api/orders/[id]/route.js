import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";
import { broadcastSSE } from "@/lib/sse";
import { cancelOrder } from "@/lib/services/order-service";

// PATCH: Sequential order status transition or order cancellation
export async function PATCH(req, { params }) {
  try {
    const user = getUserFromRequest(req);
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

    // 1. Authorization check
    // Sequential updates are restricted to OWNER/MANAGER. 
    // Cancellation is allowed for OWNER, MANAGER, or CUSTOMER (checked later in service for customer ownership).
    const allowedRoles = isCancellation
      ? ["OWNER", "MANAGER", "CUSTOMER"]
      : ["OWNER", "MANAGER"];

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Process Cancellation
    if (isCancellation) {
      const result = await cancelOrder(id, user.id, user.role);

      // Broadcast order update
      broadcastSSE("ORDER_UPDATED", result.order);

      // Broadcast stock updates for each refunded item
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

    // 3. Process Sequential Status Transitions (PENDING -> PREPARING -> READY)
    // Fetch current order status
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = order.status.toUpperCase();

    // Enforce sequential state transitions
    let isValidTransition = false;
    if (currentStatus === "PENDING" && nextStatus === "PREPARING") {
      isValidTransition = true;
    } else if (currentStatus === "PREPARING" && nextStatus === "READY") {
      isValidTransition = true;
    }

    if (!isValidTransition) {
      return NextResponse.json(
        {
          error: `Invalid state transition from ${currentStatus} to ${nextStatus}. Sequential flow must be followed: PENDING -> PREPARING -> READY`,
        },
        { status: 400 }
      );
    }

    // Update order status
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

    // Broadcast SSE update
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
