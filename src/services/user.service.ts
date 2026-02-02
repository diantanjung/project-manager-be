import { eq, ilike, or, and, asc, desc, count, SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, tasks, projects } from "../db/schema.js";
import bcrypt from "bcryptjs";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "productOwner" | "projectManager" | "teamMember";
  sortBy?: "name" | "email" | "role" | "createdAt" | "updatedAt";
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
      role,
      sortBy = "createdAt",
      order = "desc",
    } = options;

    const offset = (page - 1) * limit;

    // Build filters
    const filters: SQL[] = [];

    if (search) {
      filters.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      );
    }

    if (role) {
      filters.push(eq(users.role, role));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Build order by
    const sortColumn = users[sortBy];
    const orderBy = order === "asc" ? asc(sortColumn) : desc(sortColumn);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(users)
      .where(whereClause);

    // Get paginated data
    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
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
        role: users.role,
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

  async getUserTasks(userId: number, options: PaginationOptions = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Filter: tasks where user is creator or assignee
    const userTasksFilter = or(
      eq(tasks.creatorId, userId),
      eq(tasks.assigneeId, userId)
    );

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(tasks)
      .where(userTasksFilter);

    // Get paginated tasks with related data
    const data = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        projectId: tasks.projectId,
        projectName: projects.name,
        creatorId: tasks.creatorId,
        assigneeId: tasks.assigneeId,
        dueDate: tasks.dueDate,
        position: tasks.position,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(userTasksFilter)
      .orderBy(desc(tasks.createdAt))
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
};
