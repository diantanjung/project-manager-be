import { and, eq, exists, or, SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects, projectTeams, taskAssignments, tasks, teamMembers } from "../db/schema.js";
import { UserRole, hasRole } from "../middlewares/rbac.js";

export interface AuthUser {
    id: number;
    role?: string;
}

const elevatedReadRoles: UserRole[] = ["productOwner", "admin"];

const asUserRole = (role?: string): UserRole =>
    role === "admin" ||
    role === "productOwner" ||
    role === "projectManager" ||
    role === "teamMember"
        ? role
        : "teamMember";

const hasElevatedReadAccess = (user: AuthUser) =>
    elevatedReadRoles.some((role) => hasRole(asUserRole(user.role), role));

const primaryTeamMembershipExists = (userId: number) =>
    exists(
        db
            .select({ id: teamMembers.id })
            .from(teamMembers)
            .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, projects.teamId)))
    );

const additionalTeamMembershipExists = (userId: number) =>
    exists(
        db
            .select({ id: projectTeams.id })
            .from(projectTeams)
            .innerJoin(teamMembers, eq(teamMembers.teamId, projectTeams.teamId))
            .where(and(eq(projectTeams.projectId, projects.id), eq(teamMembers.userId, userId)))
    );

const additionalTaskAssignmentExists = (userId: number) =>
    exists(
        db
            .select({ id: taskAssignments.id })
            .from(taskAssignments)
            .where(and(eq(taskAssignments.taskId, tasks.id), eq(taskAssignments.userId, userId)))
    );

const taskProjectAccessExists = (user: AuthUser) =>
    exists(
        db
            .select({ id: projects.id })
            .from(projects)
            .where(and(eq(projects.id, tasks.projectId), authorizationService.projectAccessWhere(user)!))
    );

export const authorizationService = {
    asUserRole,

    hasElevatedReadAccess,

    projectAccessWhere(user: AuthUser): SQL | undefined {
        if (hasElevatedReadAccess(user)) {
            return undefined;
        }

        return or(
            eq(projects.ownerId, user.id),
            primaryTeamMembershipExists(user.id),
            additionalTeamMembershipExists(user.id)
        );
    },

    taskAccessWhere(user: AuthUser): SQL | undefined {
        if (hasElevatedReadAccess(user)) {
            return undefined;
        }

        return or(
            eq(tasks.creatorId, user.id),
            eq(tasks.assigneeId, user.id),
            additionalTaskAssignmentExists(user.id),
            taskProjectAccessExists(user)
        );
    },

    canManageProject(user: AuthUser, project: { ownerId: number }): boolean {
        const role = asUserRole(user.role);
        return hasRole(role, "productOwner") || project.ownerId === user.id;
    },

    async canAccessProject(user: AuthUser, projectId: number): Promise<boolean> {
        if (hasElevatedReadAccess(user)) {
            return true;
        }

        const [project] = await db
            .select({ id: projects.id })
            .from(projects)
            .where(and(eq(projects.id, projectId), this.projectAccessWhere(user)!));

        return Boolean(project);
    },

    async canCreateProjectForTeam(user: AuthUser, teamId: number): Promise<boolean> {
        if (hasRole(asUserRole(user.role), "productOwner")) {
            return true;
        }

        const [membership] = await db
            .select({ id: teamMembers.id })
            .from(teamMembers)
            .where(
                and(
                    eq(teamMembers.teamId, teamId),
                    eq(teamMembers.userId, user.id),
                    or(eq(teamMembers.role, "owner"), eq(teamMembers.role, "admin"))
                )
            );

        return Boolean(membership);
    },
};
