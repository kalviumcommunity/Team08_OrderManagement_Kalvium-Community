/**
 * Order Cancellation & Low-Stock Alerts Test Suite
 * Validates atomic order cancellation, stock restoration, audit log writing,
 * and low-stock alert triggers.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runCancellationAlertsTests() {
  console.log(`Starting Cancellation & Low-Stock Alerts Tests against: ${BASE_URL}\n`);
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  let adminToken = "";
  let customerToken = "";
  let defaultProduct = null;
  let orderId = "";

  // 1. Login as Admin
  await test("POST /api/auth/login (Admin)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@orderflow.com",
        password: "admin123",
      }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    adminToken = data.token;
  });

  // 2. Login as Customer
  await test("POST /api/auth/login (Customer)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@orderflow.com",
        password: "customer123",
      }),
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    customerToken = data.token;
  });

  // 3. Find Default Product
  await test("GET /api/products (Initial stock check)", async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    defaultProduct = data.products.find(p => p.name === "Default Product");
    if (!defaultProduct) throw new Error("Default Product not found");
    console.log(`   Product ID: ${defaultProduct.id}, Stock: ${defaultProduct.stock}, Low Stock Threshold: ${defaultProduct.lowStockThreshold}`);
  });

  // 4. Place order
  await test("POST /api/orders (Place order for 3 items)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: "Bob",
        items: [{ productId: defaultProduct.id, quantity: 3 }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Order failed: ${err.error || res.statusText}`);
    }

    const data = await res.json();
    orderId = data.order.id;

    // Verify stock dropped to 7
    const prodRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const prodData = await prodRes.json();
    const updatedProd = prodData.products.find(p => p.id === defaultProduct.id);
    if (updatedProd.stock !== 7) {
      throw new Error(`Expected stock 7, got ${updatedProd.stock}`);
    }
    console.log(`   Stock correctly decremented to ${updatedProd.stock}`);
    defaultProduct = updatedProd;
  });

  // 5. Connect to SSE and test cancellation with stock refund
  await test("GET /api/sse & PATCH /api/orders/[id] (Cancel Order & Refund Stock)", async () => {
    const sseResponse = await fetch(`${BASE_URL}/api/sse`);
    if (!sseResponse.ok) throw new Error(`SSE stream failed: ${sseResponse.status}`);
    const reader = sseResponse.body.getReader();

    // Read connected ping
    const { value: firstChunk } = await reader.read();
    const firstText = new TextDecoder().decode(firstChunk);
    if (!firstText.includes("connected")) {
      throw new Error(`Unexpected initial sse chunk: ${firstText}`);
    }

    // Call cancellation PATCH as customer
    const cancelRes = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ status: "CANCELLED" }),
    });

    if (!cancelRes.ok) {
      const err = await cancelRes.json();
      throw new Error(`Cancellation failed: ${err.error || cancelRes.statusText}`);
    }

    // Read SSE stream for ORDER_UPDATED & STOCK_UPDATED
    let orderUpdatedReceived = false;
    let stockUpdatedReceived = false;
    let accumulatedText = "";

    while (!orderUpdatedReceived || !stockUpdatedReceived) {
      const { value: chunk } = await reader.read();
      accumulatedText += new TextDecoder().decode(chunk);
      if (accumulatedText.includes("ORDER_UPDATED") && accumulatedText.includes("CANCELLED")) {
        orderUpdatedReceived = true;
      }
      if (accumulatedText.includes("STOCK_UPDATED") && accumulatedText.includes('"stock":10')) {
        stockUpdatedReceived = true;
      }
    }

    console.log("   SSE received CANCELLED order update and STOCK_UPDATED refund events.");

    // Check product stock is back to 10
    const prodRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const prodData = await prodRes.json();
    const updatedProd = prodData.products.find(p => p.id === defaultProduct.id);
    if (updatedProd.stock !== 10) {
      throw new Error(`Expected stock 10 after cancellation, got ${updatedProd.stock}`);
    }
    console.log(`   Product stock successfully refunded back to ${updatedProd.stock}`);
    defaultProduct = updatedProd;
    await reader.cancel();
  });

  // 6. Test Low-Stock Alert trigger (place order for 6 items, dropping stock from 10 to 4, threshold is 5)
  await test("POST /api/orders & SSE (Verify Low-Stock Alert trigger)", async () => {
    const sseResponse = await fetch(`${BASE_URL}/api/sse`);
    const reader = sseResponse.body.getReader();
    await reader.read(); // Skip connect ping

    // Place order for 6 items
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: "Alice",
        items: [{ productId: defaultProduct.id, quantity: 6 }],
      }),
    });

    if (!res.ok) throw new Error("Order placement failed");

    // Read SSE stream chunks until we get LOW_STOCK_ALERT
    let lowStockAlertReceived = false;
    let accumulatedText2 = "";

    while (!lowStockAlertReceived) {
      const { value: chunk } = await reader.read();
      accumulatedText2 += new TextDecoder().decode(chunk);
      if (accumulatedText2.includes("LOW_STOCK_ALERT") && accumulatedText2.includes('"stock":4')) {
        lowStockAlertReceived = true;
      }
    }

    console.log("   SSE received LOW_STOCK_ALERT event correctly.");
    await reader.cancel();
  });

  // 7. Test log entry verification
  await test("GET /api/inventory/logs (Verify cancellation refund logs)", async () => {
    const res = await fetch(`${BASE_URL}/api/inventory/logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    
    const refundLog = data.logs.find(l => l.reason.includes("Order Cancelled"));
    if (!refundLog) throw new Error("Cancellation refund log not found in inventory logs");
    
    console.log(`   Found cancellation log: previousStock=${refundLog.previousQuantity}, newStock=${refundLog.newQuantity}, change=${refundLog.changeAmount}`);
  });

  console.log(`\nCancellation & Low-Stock Alerts Test Summary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runCancellationAlertsTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
