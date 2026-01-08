import { z } from "zod";

const API_URL = "http://localhost:3000/api/users";

const run = async () => {
  console.log("🧪 Starting User CRUD Verification...");

  // 1. Create User
  console.log("\n[1] Creating User...");
  const createRes = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  const getRes = await fetch(`${API_URL}/${userId}`);
  const user = await getRes.json();
  console.log("   Response:", getRes.status, user);

  // 3. Update User
  console.log(`\n[3] Updating User ${userId}...`);
  const updateRes = await fetch(`${API_URL}/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Updated Name" }),
  });
  const updatedUser = await updateRes.json();
  console.log("   Response:", updateRes.status, updatedUser);

  // 4. Delete User
  console.log(`\n[4] Deleting User ${userId}...`);
  const deleteRes = await fetch(`${API_URL}/${userId}`, {
    method: "DELETE",
  });
  const deleteData = await deleteRes.json();
  console.log("   Response:", deleteRes.status, deleteData);

  console.log("\n✅ Verification Complete!");
};

run().catch(console.error);
