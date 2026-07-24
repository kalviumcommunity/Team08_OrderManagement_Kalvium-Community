const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runNewApiTests() {
  console.log(`Starting New API & SSE Tests against: ${BASE_URL}\n`);
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
    if (!data.token) throw new Error("Token missing from login response");
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
    if (!data.token) throw new Error("Token missing from login response");
    customerToken = data.token;
  });

  // 3. GET /api/products
  await test("GET /api/products", async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.products)) throw new Error("Products list is not an array");
    defaultProduct = data.products.find(p => p.name === "Default Product");
    if (!defaultProduct) throw new Error("Default Product not found in list");
    console.log(`   Found Default Product - ID: ${defaultProduct.id}, Stock: ${defaultProduct.stock}`);
  });

  // 4. POST /api/orders (Place order and verify stock decrement & log)
  let orderId = "";
  await test("POST /api/orders (Place order as Customer)", async () => {
    const quantityToOrder = 2;
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: "Alice",
        items: [
          {
            productId: defaultProduct.id,
            quantity: quantityToOrder,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Order failed: ${err.error || res.statusText}`);
    }

    const data = await res.json();
    if (!data.order || !data.order.id) throw new Error("Order ID missing from response");
    orderId = data.order.id;

    // Verify stock decrement
    const prodRes = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const prodData = await prodRes.json();
    const updatedProduct = prodData.products.find(p => p.id === defaultProduct.id);
    const expectedStock = defaultProduct.stock - quantityToOrder;

    if (updatedProduct.stock !== expectedStock) {
      throw new Error(`Stock mismatch: expected ${expectedStock}, got ${updatedProduct.stock}`);
    }
    console.log(`   Stock correctly decremented from ${defaultProduct.stock} to ${updatedProduct.stock}`);
    defaultProduct = updatedProduct; // Update local ref
  });

  // 5. PATCH /api/products (Direct restock by Admin)
  await test("PATCH /api/products (Restock as Admin)", async () => {
    const restockAmount = 5;
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        productId: defaultProduct.id,
        changeAmount: restockAmount,
        reason: "Supplier Restock",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Restock failed: ${err.error || res.statusText}`);
    }

    const data = await res.json();
    const expectedStock = defaultProduct.stock + restockAmount;
    if (data.product.stock !== expectedStock) {
      throw new Error(`Stock mismatch after restock: expected ${expectedStock}, got ${data.product.stock}`);
    }
    console.log(`   Stock correctly increased from ${defaultProduct.stock} to ${data.product.stock}`);
    defaultProduct = data.product; // Update local ref
  });

  // 6. PATCH /api/products (Forbidden role check for Customer)
  await test("PATCH /api/products (Should fail for Customer role)", async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        productId: defaultProduct.id,
        changeAmount: 1,
        reason: "Unauthorized adjustment",
      }),
    });

    if (res.status !== 403) {
      throw new Error(`Expected HTTP status 403, got ${res.status}`);
    }
  });

  // 7. GET /api/inventory/logs (Audit logging verify by Admin)
  await test("GET /api/inventory/logs (Retrieve logs as Admin)", async () => {
    const res = await fetch(`${BASE_URL}/api/inventory/logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.logs)) throw new Error("Logs list is not an array");

    // Check if the restock log exists
    const restockLog = data.logs.find(log => log.reason === "Supplier Restock");
    if (!restockLog) throw new Error("Direct restock log not recorded in audit log");

    // Check if the order log exists
    const orderLog = data.logs.find(log => log.reason === "Order placed by Alice");
    if (!orderLog) throw new Error("Order log not recorded in audit log");

    console.log(`   Found direct restock log: ${restockLog.changeAmount} units, Reason: ${restockLog.reason}`);
    console.log(`   Found order place log: ${orderLog.changeAmount} units, Reason: ${orderLog.reason}`);
  });

  // 8. GET /api/inventory/logs (Forbidden role check for Customer)
  await test("GET /api/inventory/logs (Should fail for Customer role)", async () => {
    const res = await fetch(`${BASE_URL}/api/inventory/logs`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP status 403, got ${res.status}`);
    }
  });

  // 9. GET /api/sse (Verify SSE event stream and real-time broadcasts)
  await test("GET /api/sse (Verify SSE and sequential transition broadcast)", async () => {
    // Start reading SSE stream
    const sseResponse = await fetch(`${BASE_URL}/api/sse`);
    if (!sseResponse.ok) throw new Error(`Failed to connect to SSE stream: ${sseResponse.status}`);
    const reader = sseResponse.body.getReader();

    // Read first chunk (ping/connected event)
    const { value: firstChunk } = await reader.read();
    const firstText = new TextDecoder().decode(firstChunk);
    if (!firstText.includes("connected")) {
      throw new Error(`Expected initial connected message, got: ${firstText}`);
    }
    console.log("   SSE connection established successfully.");

    // Perform an order status transition: PENDING -> PREPARING
    const transitionRes = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: "PREPARING",
      }),
    });

    if (!transitionRes.ok) {
      const err = await transitionRes.json();
      throw new Error(`Status transition failed: ${err.error || transitionRes.statusText}`);
    }

    // Read second chunk from SSE stream (should capture ORDER_UPDATED event)
    const { value: sseChunk } = await reader.read();
    const sseText = new TextDecoder().decode(sseChunk);
    if (!sseText.includes("ORDER_UPDATED") && !sseText.includes("PREPARING")) {
      throw new Error(`Expected ORDER_UPDATED message in SSE stream, got: ${sseText}`);
    }
    console.log("   SSE broadcast correctly received ORDER_UPDATED status transition.");

    // Clean up
    await reader.cancel();
  });

  console.log(`\nNew API & SSE Test Summary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runNewApiTests().catch((err) => {
  console.error("New API & SSE Test execution failed:", err);
  process.exit(1);
});
