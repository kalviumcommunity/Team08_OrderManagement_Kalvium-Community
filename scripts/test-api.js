const { PrismaClient } = require("@prisma/client");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const prisma = new PrismaClient();

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

  // Tokens acquired during login
  let adminToken = "";
  let customerToken = "";

  // 1. Test Custom Login (Admin Success)
  await test("POST /api/auth/login (Admin Success)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@orderflow.com",
        password: "admin123",
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }
    const data = await res.json();
    adminToken = data.token;
    if (!adminToken) throw new Error("Authentication token missing in response body");
  });

  // 2. Test Custom Login (Customer Success)
  await test("POST /api/auth/login (Customer Success)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "customer@orderflow.com",
        password: "customer123",
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }
    const data = await res.json();
    customerToken = data.token;
  });

  // 3. Test Custom Login (Invalid Password)
  await test("POST /api/auth/login (Invalid Password Rejection)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@orderflow.com",
        password: "wrongpassword",
      }),
    });

    if (res.status !== 401) {
      throw new Error(`Expected status 401 for invalid password, got ${res.status}`);
    }
  });

  // 4. Test User Registration
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

  // 5. Test Forgot Password
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

  // Fetch product for order tests
  const product = await prisma.product.findFirst();
  if (!product) {
    console.error("No product found in database. Seed the database first!");
    process.exit(1);
  }

  let placedOrderId = "";

  // 6. Test Placing a valid Order (Decrements Stock)
  await test("POST /api/orders (Place Valid Order)", async () => {
    const prevStock = product.stock;
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: product.id, quantity: 2 }],
        customerName: "Alice customer",
      }),
    });

    if (res.status !== 201) {
      const err = await res.json();
      throw new Error(`Expected status 201, got ${res.status}: ${err.error || ""}`);
    }

    const data = await res.json();
    placedOrderId = data.order.id;

    // Verify stock decremented in DB
    const freshProduct = await prisma.product.findUnique({ where: { id: product.id } });
    if (freshProduct.stock !== prevStock - 2) {
      throw new Error(`Expected stock to be ${prevStock - 2}, got ${freshProduct.stock}`);
    }
  });

  // 7. Test Placing an Order with Insufficient Stock
  await test("POST /api/orders (Place Order with Insufficient Stock - Fails)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: product.id, quantity: 999 }],
        customerName: "Alice customer",
      }),
    });

    if (res.status === 201 || res.status === 200) {
      throw new Error("Expected order placement to fail, but it succeeded");
    }
  });

  // 8. Test Listing Orders as Customer (Forbidden)
  await test("GET /api/orders (Customer Access - Forbidden)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    if (res.status !== 403) {
      throw new Error(`Expected status 403, got ${res.status}`);
    }
  });

  // 9. Test Listing Orders as Owner (Allowed)
  await test("GET /api/orders (Owner Access - Allowed)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }
    const data = await res.json();
    if (!data.orders || data.orders.length === 0) {
      throw new Error("Orders list is empty or missing");
    }
  });

  // 10. Test Non-Sequential Status Update (Fails)
  await test("PATCH /api/orders/[id] (Non-Sequential Status Update - Fails)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${placedOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: "READY", // Trying to jump from PENDING directly to READY
      }),
    });

    if (res.status === 200) {
      throw new Error("Expected status update to fail, but it succeeded");
    }
  });

  // 11. Test Sequential Status Update (Succeeds)
  await test("PATCH /api/orders/[id] (Sequential Transition: PENDING -> PREPARING)", async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${placedOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: "PREPARING",
      }),
    });

    if (res.status !== 200) {
      const err = await res.json();
      throw new Error(`Expected status 200, got ${res.status}: ${err.error}`);
    }
  });

  console.log(`\nSummary: ${passed} Passed, ${failed} Failed.`);
  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runApiTests().catch((err) => {
  console.error("Test execution failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
