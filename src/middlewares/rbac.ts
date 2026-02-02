import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js";
import { userService } from "../services/user.service.js";

// Define role hierarchy (higher index = more permissions)
const roleHierarchy = {
    teamMember: 1,
    projectManager: 2,
    productOwner: 3,
    admin: 4,
};

export type UserRole = keyof typeof roleHierarchy;

/**
 * Middleware to require a minimum role level
 * @param requiredRole - The minimum role required to access the resource
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            const user = await userService.getUserById(req.user.id);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            const userRole = user.role as UserRole;

            // Check if user's role is in the allowed roles
            if (!allowedRoles.includes(userRole)) {
                // Or check if user has a higher role in hierarchy
                const userRoleLevel = roleHierarchy[userRole] || 0;
                const hasHigherRole = allowedRoles.some(
                    (role) => userRoleLevel >= roleHierarchy[role]
                );

                if (!hasHigherRole) {
                    return res.status(403).json({
                        message: "Access denied. Insufficient permissions.",
                        requiredRoles: allowedRoles,
                        userRole: userRole,
                    });
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole("admin");

/**
 * Middleware to require at least productOwner role
 */
export const requireProductOwner = requireRole("productOwner", "admin");

/**
 * Middleware to require at least projectManager role
 */
export const requireProjectManager = requireRole("projectManager", "productOwner", "admin");

/**
 * Helper to check if a user has a specific role or higher
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
