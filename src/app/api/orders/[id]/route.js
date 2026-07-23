import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helper";

// PATCH: Sequential order status transition (PENDING -> PREPARING -> READY)
export async function PATCH(req, { params }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER or MANAGER can transition status
    const allowedRoles = ["OWNER", "MANAGER"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const nextStatus = status.toUpperCase();

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
    });

    return NextResponse.json(
      { message: `Order status updated to ${nextStatus}`, order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH order status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
