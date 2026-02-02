import { eq, count, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { teams, teamMembers, users } from "../db/schema.js";

export interface TeamPaginationOptions {
    page?: number;
    limit?: number;
}

export const teamService = {
    async createTeam(data: typeof teams.$inferInsert) {
        const [newTeam] = await db.insert(teams).values(data).returning();
        return newTeam;
    },

    async getAllTeams(options: TeamPaginationOptions = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const [{ total }] = await db.select({ total: count() }).from(teams);

        const data = await db
            .select()
            .from(teams)
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

    async getTeamById(id: number) {
        const [team] = await db.select().from(teams).where(eq(teams.id, id));
        return team;
    },

    async updateTeam(id: number, data: Partial<typeof teams.$inferInsert>) {
        const [updatedTeam] = await db
            .update(teams)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(teams.id, id))
            .returning();
        return updatedTeam;
    },

    async deleteTeam(id: number) {
        const [deletedTeam] = await db
            .delete(teams)
            .where(eq(teams.id, id))
            .returning();
        return deletedTeam;
    },

    // Team Members
    async getTeamMembers(teamId: number) {
        const members = await db
            .select({
                id: teamMembers.id,
                userId: teamMembers.userId,
                userName: users.name,
                userEmail: users.email,
                role: teamMembers.role,
                joinedAt: teamMembers.joinedAt,
            })
            .from(teamMembers)
            .leftJoin(users, eq(teamMembers.userId, users.id))
            .where(eq(teamMembers.teamId, teamId));
        return members;
    },

    async addTeamMember(teamId: number, userId: number, role: string = "member") {
        // Check if already a member
        const [existing] = await db
            .select()
            .from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

        if (existing) {
            return { error: "User is already a member of this team" };
        }

        const [newMember] = await db
            .insert(teamMembers)
            .values({ teamId, userId, role })
            .returning();
        return newMember;
    },

    async removeTeamMember(teamId: number, userId: number) {
        const [deleted] = await db
            .delete(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
            .returning();
        return deleted;
    },
};
