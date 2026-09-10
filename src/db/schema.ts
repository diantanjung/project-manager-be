import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  bigint,
  bigserial,
  boolean,
  pgEnum,
  date,
  varchar,
  uuid,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// Enums
// ============================================================================

export const taskStatusEnum = pgEnum("task_status", [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "task_assigned",
  "mention",
  "system_alert",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// ============================================================================
// Users
// ============================================================================

type UserRole = "admin" | "productOwner" | "projectManager" | "teamMember";

export const users = pgTable("users", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarStorageKey: text("avatar_url"),
  role: varchar("role", { length: 255 }).$type<UserRole>().default("teamMember").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  teamMemberships: many(teamMembers),
  comments: many(comments),
  receivedNotifications: many(notifications, { relationName: "receivedNotifications" }),
}));

// ============================================================================
// Refresh Tokens
// ============================================================================

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("hash_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRevoked: boolean("is_revoked").default(false),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Teams
// ============================================================================

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  projects: many(projects),
}));

// ============================================================================
// Team Members (Join Table: Users <-> Teams)
// ============================================================================

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("member"), // e.g., "owner", "admin", "member"
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Projects
// ============================================================================

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: bigint("owner_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  tasks: many(tasks),
  projectTeams: many(projectTeams),
}));

// ============================================================================
// Project Teams (Join Table: Projects <-> Teams for additional team assignments)
// ============================================================================

export const projectTeams = pgTable("project_teams", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const projectTeamsRelations = relations(projectTeams, ({ one }) => ({
  project: one(projects, {
    fields: [projectTeams.projectId],
    references: [projects.id],
  }),
  team: one(teams, {
    fields: [projectTeams.teamId],
    references: [teams.id],
  }),
}));

// ============================================================================
// Tasks
// ============================================================================

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("backlog").notNull(),
  priority: taskPriorityEnum("priority").default("medium"),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  creatorId: bigint("creator_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assigneeId: bigint("assignee_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dueDate: date("due_date"),
  position: integer("position").default(0), // For ordering within a status column
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  comments: many(comments),
  attachments: many(attachments),
  taskAssignments: many(taskAssignments),
}));

// ============================================================================
// Task Assignments (Join Table: Tasks <-> Users for additional assignees)
// ============================================================================

export const taskAssignments = pgTable("task_assignments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const taskAssignmentsRelations = relations(taskAssignments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignments.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Comments
// ============================================================================

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  authorId: bigint("author_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// ============================================================================
// Attachments
// ============================================================================

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(), // Cloudflare R2 URL
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  uploaderId: bigint("uploader_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
  uploader: one(users, {
    fields: [attachments.uploaderId],
    references: [users.id],
  }),
}));

// ============================================================================
// Notifications
// ============================================================================

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 255 }).notNull(),
  notifiableType: varchar("notifiable_type", { length: 255 }).notNull(),
  notifiableId: bigint("notifiable_id", { mode: "number" }).notNull(),
  data: text("data").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.notifiableId],
    references: [users.id],
    relationName: "receivedNotifications",
  }),
}));

// ============================================================================
// Activity Logs
// ============================================================================

export const activityLogs = pgTable("activity_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  actorId: bigint("actor_id", { mode: "number" }).references(() => users.id, {
    onDelete: "set null",
  }),
  entityType: varchar("entity_type", { length: 255 }).notNull(),
  entityId: bigint("entity_id", { mode: "number" }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  before: json("before").$type<Record<string, unknown> | null>(),
  after: json("after").$type<Record<string, unknown> | null>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at"),
});
