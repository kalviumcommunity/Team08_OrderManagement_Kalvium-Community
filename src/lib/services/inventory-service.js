import prisma from "../prisma";

export async function listInventoryLogs() {
  return await prisma.inventoryLog.findMany({
    orderBy: { timestamp: "desc" },
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
