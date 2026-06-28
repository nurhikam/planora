// Planora Manual Test Script - Native Fetch (Node 22+)

const BASE_URL = "http://localhost:3000";

async function testAPI() {
  console.log("\n🧪 Testing Planora API...\n");

  try {
    // Test 1: Homepage
    console.log("1. Testing homepage...");
    const homeRes = await fetch(`${BASE_URL}/`);
    console.log(`   Status: ${homeRes.status} ${homeRes.ok ? "✅" : "❌"}`);

    // Test 2: Login page
    console.log("\n2. Testing login page...");
    const loginPageRes = await fetch(`${BASE_URL}/login`);
    console.log(
      `   Status: ${loginPageRes.status} ${loginPageRes.ok ? "✅" : "❌"}`,
    );

    // Test 3: Register page
    console.log("\n3. Testing register page...");
    const registerPageRes = await fetch(`${BASE_URL}/register`);
    console.log(
      `   Status: ${registerPageRes.status} ${registerPageRes.ok ? "✅" : "❌"}`,
    );

    // Test 4: Tasks API (should 401 if not authed)
    console.log("\n4. Testing tasks API (unauthenticated)...");
    const tasksRes = await fetch(`${BASE_URL}/api/tasks`);
    console.log(
      `   Status: ${tasksRes.status} ${tasksRes.status === 401 || tasksRes.status === 200 ? "✅" : "⚠️"}`,
    );

    // Test 5: Login API
    console.log("\n5. Testing login API...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "demo@planora.app",
        password: "demo123456",
      }),
    });
    console.log(
      `   Status: ${loginRes.status} ${loginRes.ok || loginRes.status === 302 ? "✅" : "⚠️"}`,
    );

    console.log("\n✅ All API tests completed!\n");
    console.log(
      "📝 Next: Open http://localhost:3000 in browser for manual UI testing\n",
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.log("\nMake sure dev server is running: npm run dev\n");
  }
}

testAPI();
