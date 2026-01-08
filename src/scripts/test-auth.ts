const API_URL = "http://localhost:3000/api";

const run = async () => {
  console.log("🔐 Starting Auth Verification...");

  // 1. Register
  console.log("\n[1] Registering User...");
  const email = `auth-test-${Date.now()}@example.com`;
  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Auth User",
      email,
      password: "password123",
    }),
  });
  const registeredUser = await registerRes.json();
  console.log("   Response:", registerRes.status, registeredUser);

  // 2. Login
  console.log("\n[2] Logging In...");
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "password123",
    }),
  });
  const loginData = (await loginRes.json()) as { token: string };
  console.log(
    "   Response:",
    loginRes.status,
    loginData.token ? "Token received" : "No token"
  );

  if (!loginData.token) throw new Error("Login failed");

  // 3. Protected Route (Optional: Try to get own user details)
  // For now we just verify we have the token.
  console.log("\n✅ Auth Verification Complete!");
};

run().catch(console.error);
