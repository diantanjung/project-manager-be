import { eq, ilike, or, asc, desc, count, SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import bcrypt from "bcryptjs";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "email" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

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

  async getAllUsers(options: PaginationOptions = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = options;

    const offset = (page - 1) * limit;

    // Build search filter
    const searchFilter: SQL | undefined = search
      ? or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`)
      )
      : undefined;

    // Build order by
    const sortColumn = users[sortBy];
    const orderBy = order === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(users)
      .where(searchFilter);

    // Get paginated data
    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(searchFilter)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
