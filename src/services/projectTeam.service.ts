import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { projectTeams, teams } from "../db/schema.js";

export const projectTeamService = {
    async assignTeamToProject(projectId: number, teamId: number) {
        // Check if assignment already exists
        const existing = await db
            .select()
            .from(projectTeams)
            .where(
                and(
                    eq(projectTeams.projectId, projectId),
                    eq(projectTeams.teamId, teamId)
                )
            );

        if (existing.length > 0) {
            return { exists: true, data: existing[0] };
        }

        const [assignment] = await db
            .insert(projectTeams)
            .values({ projectId, teamId })
            .returning();

        return { exists: false, data: assignment };
    },

    async getProjectTeams(projectId: number) {
        const data = await db
            .select({
                id: projectTeams.id,
                projectId: projectTeams.projectId,
                teamId: projectTeams.teamId,
                teamName: teams.name,
                teamDescription: teams.description,
                assignedAt: projectTeams.assignedAt,
            })
            .from(projectTeams)
            .leftJoin(teams, eq(projectTeams.teamId, teams.id))
            .where(eq(projectTeams.projectId, projectId));

        return data;
    },

    async getAssignmentById(id: number) {
        const [assignment] = await db
            .select()
            .from(projectTeams)
            .where(eq(projectTeams.id, id));
        return assignment;
    },

    async removeTeamFromProject(id: number) {
        const [deleted] = await db
            .delete(projectTeams)
            .where(eq(projectTeams.id, id))
            .returning();
        return deleted;
    },
};
