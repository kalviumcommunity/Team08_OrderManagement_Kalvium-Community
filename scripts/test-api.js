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
    // Get CSRF Token and Cookie
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

    // NextAuth returns 401 or redirects to error URL on invalid credentials
    const isRejected = loginRes.status === 401 || loginRes.status === 403 || loginRes.url.includes("error");
    if (!isRejected && loginRes.status === 200) {
      const data = await loginRes.json();
      if (data.url && data.url.includes("error")) return; // passed
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

  console.log(`\nSummary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runApiTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
