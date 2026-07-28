import prisma from "../prisma";

export async function createOrder(payload) {
  // Note: the route handler POST /api/orders implements order creation in a transaction directly,
  // but we can provide this placeholder / wrapper if needed.
  return { success: true, payload };
}

export async function updateOrderStatus(orderId, status) {
  return { success: true, orderId, status };
}

/**
 * Cancels an order and refunds product stock.
 * Runs in a Prisma transaction to ensure atomicity.
 * 
 * @param {string} orderId 
 * @param {string} userId - ID of the user requesting cancellation
 * @param {string} role - Role of the user requesting cancellation
 */
export async function cancelOrder(orderId, userId, role) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch order
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // 2. Authorization check
    // If CUSTOMER, they can only cancel their own orders
    if (role === "CUSTOMER" && order.userId !== userId) {
      throw new Error("Unauthorized to cancel this order");
    }

    const currentStatus = order.status.toUpperCase();

    // 3. Validation: can only cancel PENDING or PREPARING
    if (currentStatus === "CANCELLED") {
      throw new Error("Order is already cancelled");
    }

    if (currentStatus === "READY") {
      throw new Error("Cannot cancel order once it is READY");
    }

    if (currentStatus !== "PENDING" && currentStatus !== "PREPARING") {
      throw new Error(`Cannot cancel order in status: ${currentStatus}`);
    }

    // 4. Update order status to CANCELLED
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const refundLogs = [];

    // 5. Refund stock and write inventory logs
    for (const item of order.items) {
      const { productId, quantity } = item;

      // Fetch current product to check stock level
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      const previousQuantity = product.stock;
      const newQuantity = previousQuantity + quantity;

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newQuantity },
      });

      // Create inventory log for refund
      const log = await tx.inventoryLog.create({
        data: {
          productId,
          ownerId: role !== "CUSTOMER" ? userId : null, // Record owner/manager ID if done by them
          previousQuantity,
          newQuantity,
          changeAmount: quantity,
          reason: `Order Cancelled (ID: ${orderId}) - Stock Refunded`,
        },
        include: {
          product: true,
        },
      });

      refundLogs.push(log);
    }

    return { order: updatedOrder, logs: refundLogs };
  });
}
