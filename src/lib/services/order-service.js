import prisma from "../prisma";

/**
 * Creates an order wrapper.
 * Note: POST /api/orders handles the main transactional creation logic.
 */
export async function createOrder(payload) {
  return { success: true, payload };
}

/**
 * Updates order status wrapper.
 */
export async function updateOrderStatus(orderId, status) {
  return { success: true, orderId, status };
}

/**
 * Cancels an order and refunds product stock back into inventory.
 * Runs atomically inside a Prisma transaction to guarantee consistency.
 * 
 * @param {string} orderId - Unique UUID of the order to cancel
 * @param {string} userId - ID of the user requesting cancellation
 * @param {string} role - Role of the user (e.g. 'CUSTOMER', 'OWNER', 'MANAGER')
 * @returns {Promise<{order: object, logs: Array}>} - Updated order and created inventory refund logs
 */
export async function cancelOrder(orderId, userId, role) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch order along with items
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // 2. Authorization check: Customers can only cancel their own orders
    if (role === "CUSTOMER" && order.userId !== userId) {
      throw new Error("Unauthorized to cancel this order");
    }

    const currentStatus = order.status.toUpperCase();

    // 3. Status validation: Orders can only be cancelled if PENDING or PREPARING
    if (currentStatus === "CANCELLED") {
      throw new Error("Order is already cancelled");
    }

    if (currentStatus === "READY") {
      throw new Error("Cannot cancel order once it is READY");
    }

    if (currentStatus !== "PENDING" && currentStatus !== "PREPARING") {
      throw new Error(`Cannot cancel order in status: ${currentStatus}`);
    }

    // 4. Update order status to CANCELLED in database
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

    // 5. Restore product stock and record inventory refund audit logs
    for (const item of order.items) {
      const { productId, quantity } = item;

      // Fetch current product stock
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      const previousQuantity = product.stock;
      const newQuantity = previousQuantity + quantity;

      // Update product stock with refunded quantity
      await tx.product.update({
        where: { id: productId },
        data: { stock: newQuantity },
      });

      // Create an audit log entry for this inventory refund
      const log = await tx.inventoryLog.create({
        data: {
          productId,
          ownerId: role !== "CUSTOMER" ? userId : null, // Record staff ID if cancelled by manager/owner
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
