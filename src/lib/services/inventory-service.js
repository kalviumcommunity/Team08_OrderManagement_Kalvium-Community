export async function listInventoryLogs() {
  return [];
}

export async function restockProduct(productId, amount) {
  return { success: true, productId, amount };
}
