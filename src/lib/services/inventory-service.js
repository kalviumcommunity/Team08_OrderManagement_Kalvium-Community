import prisma from "../prisma";

/**
 * Service to fetch paginated and filtered inventory audit logs.
 * Supports filtering by product ID and search query on reason.
 * 
 * @param {object} filters - Filter criteria { productId, search, page, limit }
 * @returns {Promise<{logs: Array, pagination: object}>}
 */
export async function listInventoryLogs(filters = {}) {
  const { productId, search, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  // Build dynamic Prisma query filter
  const where = {};
  if (productId) {
    where.productId = productId;
  }
  if (search) {
    where.reason = {
      contains: search,
    };
  }

  // Retrieve total count for pagination calculations
  const totalCount = await prisma.inventoryLog.count({ where });
  const totalPages = Math.ceil(totalCount / limit);

  // Retrieve paginated logs with related product and user details
  const logs = await prisma.inventoryLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    skip,
    take: limit,
    include: {
      product: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return {
    logs,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  };
}

/**
 * Atomically adjusts stock quantity and writes an immutable audit log entry.
 * Uses Prisma $transaction to guarantee data consistency.
 * 
 * @param {string} productId - Target product ID
 * @param {string|null} ownerId - ID of the user performing the change
 * @param {number} changeAmount - Amount to add (positive) or subtract (negative)
 * @param {string} reason - Description/audit reason for the inventory change
 * @returns {Promise<{product: object, log: object}>}
 */
export async function updateStock(productId, ownerId, changeAmount, reason) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current product record
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product not found with ID: ${productId}`);
    }

    const previousQuantity = product.stock;
    const newQuantity = previousQuantity + changeAmount;

    // 2. Validate stock cannot fall below zero
    if (newQuantity < 0) {
      throw new Error(`Insufficient stock. Cannot reduce stock below zero. Available: ${previousQuantity}, Requested reduction: ${Math.abs(changeAmount)}`);
    }

    // 3. Update the product's available stock
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { stock: newQuantity },
    });

    // 4. Create an immutable inventory change log
    const log = await tx.inventoryLog.create({
      data: {
        productId,
        ownerId: ownerId || null,
        previousQuantity,
        newQuantity,
        changeAmount,
        reason: reason || "Manual adjustment",
      },
      include: {
        product: true,
      },
    });

    return { product: updatedProduct, log };
  });
}

/**
 * Convenience restock helper (kept for backward compatibility).
 * 
 * @param {string} productId - Product ID
 * @param {number} amount - Restock quantity to add
 * @param {string} ownerId - ID of user performing restock
 * @param {string} reason - Optional restock reason
 */
export async function restockProduct(productId, amount, ownerId, reason) {
  return await updateStock(productId, ownerId, amount, reason || "Restock");
}
