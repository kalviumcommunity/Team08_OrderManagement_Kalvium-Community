/**
 * API Integration Test Suite
 * Validates NextAuth providers, CSRF tokens, session endpoints, user login/registration,
 * product management, inventory stock adjustments, and order placement flows.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runApiTests() {
  console.log(`Starting API Endpoint Tests against: ${BASE_URL}\n`);
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

  // 1. Test GET /api/auth/providers
  await test("GET /api/auth/providers", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/providers`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.credentials) throw new Error("Credentials provider not found in response");
  });

  // 2. Test GET /api/auth/csrf
  await test("GET /api/auth/csrf", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/csrf`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.csrfToken) throw new Error("csrfToken missing from response");
  });

  // 3. Test GET /api/auth/session (Unauthenticated)
  await test("GET /api/auth/session (Unauthenticated)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (Object.keys(data).length > 0 && data.user) {
      throw new Error("Expected empty session for unauthenticated request");
    }
  });

  // 4. Test Credentials Login (Admin)
  await test("POST /api/auth/callback/credentials (Admin Login)", async () => {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const cookies = csrfRes.headers.get("set-cookie") || "";
    const { csrfToken } = await csrfRes.json();

    const body = new URLSearchParams({
      csrfToken,
      email: "admin@orderflow.com",
      password: "admin123",
      json: "true",
    });

    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },
      body: body.toString(),
      redirect: "manual",
    });

    if (loginRes.status !== 200 && loginRes.status !== 302) {
      throw new Error(`Unexpected response status: ${loginRes.status}`);
    }
  });

  // 5. Test Credentials Login (Invalid Password)
  await test("POST /api/auth/callback/credentials (Invalid Password Rejection)", async () => {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const cookies = csrfRes.headers.get("set-cookie") || "";
    const { csrfToken } = await csrfRes.json();

    const body = new URLSearchParams({
      csrfToken,
      email: "admin@orderflow.com",
      password: "wrongpassword",
      json: "true",
    });

    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },
      body: body.toString(),
      redirect: "manual",
    });

    const isRejected = loginRes.status === 401 || loginRes.status === 403 || loginRes.url.includes("error");
    if (!isRejected && loginRes.status === 200) {
      const data = await loginRes.json();
      if (data.url && data.url.includes("error")) return;
      throw new Error("Invalid password was accepted unexpectedly");
    }
  });

  // 6. Test User Registration
  await test("POST /api/auth/register (New User)", async () => {
    const randomEmail = `user-${Math.floor(Math.random() * 100000)}@orderflow.com`;
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: randomEmail,
        password: "testpassword123",
        role: "CUSTOMER",
      }),
    });

    if (res.status !== 201) {
      const errData = await res.json();
      throw new Error(`Expected status 201, got ${res.status}: ${errData.error || ""}`);
    }
  });

  // 7. Test Forgot Password
  await test("POST /api/auth/forgot-password", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@orderflow.com",
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }
    const data = await res.json();
    if (!data.debug || !data.debug.resetToken) {
      throw new Error("Reset token not found in debug field");
    }
  });

  // --- NEW INTEGRATION TESTS ---

  // Obtain direct API tokens for authentication
  let adminToken = "";
  let customerToken = "";

  await test("Obtain tokens via API login", async () => {
    // Admin login
    const resAdmin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@orderflow.com", password: "admin123" }),
    });
    if (!resAdmin.ok) throw new Error("Admin login failed");
    const dataAdmin = await resAdmin.json();
    adminToken = dataAdmin.token;

    // Customer login
    const resCustomer = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "customer@orderflow.com", password: "customer123" }),
    });
    if (!resCustomer.ok) throw new Error("Customer login failed");
    const dataCustomer = await resCustomer.json();
    customerToken = dataCustomer.token;

    if (!adminToken || !customerToken) throw new Error("Could not retrieve JWT tokens");
  });

  let targetProductId = "";
  let initialStock = 0;

  await test("GET /api/products (List products & find target)", async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.products || data.products.length === 0) {
      throw new Error("No products found to run tests against");
    }
    const targetProduct = data.products.find(p => p.name === "Default Product");
    if (!targetProduct) throw new Error("Default Product not found");
    targetProductId = targetProduct.id;
    initialStock = targetProduct.stock;
  });

  // Test placing order and stock decrement
  let orderId = "";
  const orderQuantity = 2;

  await test("POST /api/orders (Place order successfully)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: "Alice Tester",
        items: [{ productId: targetProductId, quantity: orderQuantity }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Order placement failed: ${err.error || ""}`);
    }

    const data = await res.json();
    if (!data.order || !data.order.id) throw new Error("Order ID not returned");
    orderId = data.order.id;

    // Verify stock is decremented
    const resProd = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const dataProd = await resProd.json();
    const product = dataProd.products.find(p => p.id === targetProductId);
    if (product.stock !== initialStock - orderQuantity) {
      throw new Error(`Stock mismatch: Expected ${initialStock - orderQuantity}, got ${product.stock}`);
    }
  });

  // Test transaction rollback on insufficient stock
  await test("POST /api/orders (Rollback on insufficient stock)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: "Greedy Customer",
        items: [{ productId: targetProductId, quantity: 99999 }], // Way higher than current stock
      }),
    });

    if (res.status !== 400) {
      throw new Error(`Expected status 400, got ${res.status}`);
    }

    const err = await res.json();
    if (!err.error || !err.error.includes("Insufficient stock")) {
      throw new Error(`Expected insufficient stock message, got: ${err.error || ""}`);
    }
  });

  // Test sequential status transitions: PENDING -> PREPARING -> READY
  await test("PATCH /api/orders/[id] (Valid transition: PENDING -> PREPARING)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "PREPARING" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Transition failed: ${err.error || ""}`);
    }

    const data = await res.json();
    if (data.order.status !== "PREPARING") {
      throw new Error(`Expected status PREPARING, got ${data.order.status}`);
    }
  });

  await test("PATCH /api/orders/[id] (Invalid transition: PREPARING -> PENDING)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "PENDING" }),
    });

    if (res.status !== 400) {
      throw new Error(`Expected status 400, got ${res.status}`);
    }
  });

  await test("PATCH /api/orders/[id] (Valid transition: PREPARING -> READY)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "READY" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Transition failed: ${err.error || ""}`);
    }

    const data = await res.json();
    if (data.order.status !== "READY") {
      throw new Error(`Expected status READY, got ${data.order.status}`);
    }
  });

  // Test cancellation and refund logic
  let order2Id = "";
  await test("PATCH /api/orders/[id] (Cancellation & stock refund)", async () => {
    // 1. Place a new order
    const resPlace = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        customerName: "Refund Tester",
        items: [{ productId: targetProductId, quantity: 1 }],
      }),
    });
    const dataPlace = await resPlace.json();
    order2Id = dataPlace.order.id;

    // 2. Get current stock before cancellation
    const resProdBefore = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const dataProdBefore = await resProdBefore.json();
    const stockBefore = dataProdBefore.products.find(p => p.id === targetProductId).stock;

    // 3. Cancel the order
    const resCancel = await fetch(`${BASE_URL}/api/orders/${order2Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (!resCancel.ok) {
      const err = await resCancel.json();
      throw new Error(`Cancel failed: ${err.error || ""}`);
    }

    // 4. Verify stock is refunded (+1)
    const resProdAfter = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const dataProdAfter = await resProdAfter.json();
    const stockAfter = dataProdAfter.products.find(p => p.id === targetProductId).stock;

    if (stockAfter !== stockBefore + 1) {
      throw new Error(`Refund failed: Stock before cancellation: ${stockBefore}, after: ${stockAfter}`);
    }
  });

  // Test direct inventory stock adjustments
  await test("PATCH /api/products (Direct inventory restock adjustment)", async () => {
    const adjustmentAmount = 5;
    const resProdBefore = await fetch(`${BASE_URL}/api/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataProdBefore = await resProdBefore.json();
    const stockBefore = dataProdBefore.products.find(p => p.id === targetProductId).stock;

    const resAdjust = await fetch(`${BASE_URL}/api/products`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        productId: targetProductId,
        changeAmount: adjustmentAmount,
        reason: "Test Restock",
      }),
    });

    if (!resAdjust.ok) {
      const err = await resAdjust.json();
      throw new Error(`Adjustment failed: ${err.error || ""}`);
    }

    const dataAdjust = await resAdjust.json();
    if (dataAdjust.product.stock !== stockBefore + adjustmentAmount) {
      throw new Error(`Stock mismatch: Expected ${stockBefore + adjustmentAmount}, got ${dataAdjust.product.stock}`);
    }
  });

  // Test search, filters, and pagination parameters
  await test("GET /api/orders (Filtering, search, pagination)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders?status=READY&search=Alice&page=1&limit=2`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.orders || !data.pagination) {
      throw new Error("Pagination metadata or orders list missing");
    }

    // Verify limit works
    if (data.orders.length > 2) {
      throw new Error(`Expected at most 2 orders, got ${data.orders.length}`);
    }

    // Verify status filter works
    for (const order of data.orders) {
      if (order.status !== "READY") {
        throw new Error(`Expected order status READY, got ${order.status}`);
      }
      if (!order.customerName.toLowerCase().includes("alice")) {
        throw new Error(`Expected customerName to contain 'Alice', got '${order.customerName}'`);
      }
    }
  });

  await test("GET /api/inventory/logs (Filtering, search, pagination)", async () => {
    const res = await fetch(`${BASE_URL}/api/inventory/logs?productId=${targetProductId}&search=Refunded&page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.logs || !data.pagination) {
      throw new Error("Pagination metadata or logs list missing");
    }

    for (const log of data.logs) {
      if (log.productId !== targetProductId) {
        throw new Error("Product ID filter failed");
      }
      if (!log.reason.toLowerCase().includes("refunded")) {
        throw new Error("Search filter on reason failed");
      }
    }
  });

  await test("GET /api/products (Filtering, search, pagination)", async () => {
    const res = await fetch(`${BASE_URL}/api/products?search=Default&page=1&limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.products || !data.pagination) {
      throw new Error("Pagination metadata or products list missing");
    }

    if (data.products.length !== 1) {
      throw new Error(`Expected 1 product, got ${data.products.length}`);
    }

    if (!data.products[0].name.toLowerCase().includes("default")) {
      throw new Error("Product search failed");
    }
  });

  console.log(`\nSummary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runApiTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
