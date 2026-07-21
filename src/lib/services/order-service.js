export async function createOrder(payload) {
  return { success: true, payload };
}

export async function updateOrderStatus(orderId, status) {
  return { success: true, orderId, status };
}
