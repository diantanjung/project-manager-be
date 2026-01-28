import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import bcrypt from "bcryptjs";

export const userService = {
  async createUser(data: typeof users.$inferInsert) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [newUser] = await db
      .insert(users)
      .values({ ...data, password: hashedPassword })
      .returning();
    const { password, ...rest } = newUser;
    return rest;
  },

  async getAllUsers() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  },

  async getUserById(id: number) {
    const [user] = await db.select(
      {
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }
    ).from(users).where(eq(users.id, id));
    return user;
  },

  async updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  },

  async deleteUser(id: number) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deletedUser;
  },
};
