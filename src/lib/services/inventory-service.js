import prisma from "../prisma";

export async function listInventoryLogs(filters = {}) {
  const { productId, search, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (productId) {
    where.productId = productId;
  }
  if (search) {
    where.reason = {
      contains: search,
    };
  }

  const totalCount = await prisma.inventoryLog.count({ where });
  const totalPages = Math.ceil(totalCount / limit);

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

export async function updateStock(productId, ownerId, changeAmount, reason) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch product
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product not found with ID: ${productId}`);
    }

    const previousQuantity = product.stock;
    const newQuantity = previousQuantity + changeAmount;

    // 2. Validate stock non-negative
    if (newQuantity < 0) {
      throw new Error(`Insufficient stock. Cannot reduce stock below zero. Available: ${previousQuantity}, Requested reduction: ${Math.abs(changeAmount)}`);
    }

    // 3. Update product stock
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { stock: newQuantity },
    });

    // 4. Create inventory log
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

// Keep a backward compatible wrapper if anything calls restockProduct
export async function restockProduct(productId, amount, ownerId, reason) {
  return await updateStock(productId, ownerId, amount, reason || "Restock");
}
