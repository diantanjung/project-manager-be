import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api`;
const USERS_URL = `${BASE_URL}/users`;
const AUTH_URL = `${BASE_URL}/auth`;

const run = async () => {
  console.log("🧪 Starting User CRUD Verification...\n");

  // 0. Register and Login to get token
  console.log("[0] Authenticating...");
  const testEmail = `crud-test-${Date.now()}@example.com`;
  const testPassword = "password123";

  // Register a test user for authentication
  const registerRes = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "CRUD Test Auth User",
      email: testEmail,
      password: testPassword,
    }),
  });

  if (!registerRes.ok) {
    // If registration fails, try to login (user might exist)
    console.log("   Registration failed, trying login...");
  }

  // Login to get token
  const loginRes = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = (await loginRes.json()) as { accessToken: string };

  if (!loginData.accessToken) {
    throw new Error("Failed to authenticate - no token received");
  }
  console.log("   ✅ Authenticated successfully\n");

  // Create authenticated headers
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${loginData.accessToken}`,
  };

  // 1. Create User
  console.log("[1] Creating User...");
  const createRes = await fetch(USERS_URL, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "password123",
    }),
  });
  const createdUser = (await createRes.json()) as { id: number };
  console.log("   Response:", createRes.status, createdUser);

  if (!createdUser.id) throw new Error("Failed to create user");
  const userId = createdUser.id;

  // 2. Get User by ID
  console.log(`\n[2] Getting User ${userId}...`);
  const getRes = await fetch(`${USERS_URL}/${userId}`, {
    headers: authHeaders,
  });
  const user = await getRes.json();
  console.log("   Response:", getRes.status, user);

  // 3. Update User
  console.log(`\n[3] Updating User ${userId}...`);
  const updateRes = await fetch(`${USERS_URL}/${userId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ name: "Updated Name" }),
  });
  const updatedUser = await updateRes.json();
  console.log("   Response:", updateRes.status, updatedUser);

  // 4. Delete User
  console.log(`\n[4] Deleting User ${userId}...`);
  const deleteRes = await fetch(`${USERS_URL}/${userId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const deleteData = await deleteRes.json();
  console.log("   Response:", deleteRes.status, deleteData);

  console.log("\n✅ CRUD Verification Complete!");
};

run().catch(console.error);
