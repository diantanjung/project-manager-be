import { db } from "./index.js";
import {
    users,
    teams,
    teamMembers,
    projects,
    projectTeams,
    tasks,
    taskAssignments,
    comments,
    attachments,
    refreshTokens,
} from "./schema.js";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Starting database seed...\n");

    try {
        // =========================================================================
        // Clean existing data (in reverse order of dependencies)
        // =========================================================================
        console.log("🧹 Cleaning existing data...");
        await db.delete(attachments);
        await db.delete(comments);
        await db.delete(taskAssignments);
        await db.delete(tasks);
        await db.delete(projectTeams);
        await db.delete(projects);
        await db.delete(teamMembers);
        await db.delete(teams);
        await db.delete(refreshTokens);
        await db.delete(users);
        console.log("✅ Existing data cleaned\n");

        // =========================================================================
        // Seed Users with RBAC Roles
        // =========================================================================
        console.log("👥 Creating users with roles...");
        const hashedPassword = await bcrypt.hash("password123", 10);

        const [adminUser, productOwner, projectManager1, projectManager2, teamMember1, teamMember2, teamMember3] = await db
            .insert(users)
            .values([
                {
                    name: "Admin User",
                    email: "admin@example.com",
                    password: hashedPassword,
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
                    role: "admin",
                },
                {
                    name: "John Product Owner",
                    email: "john@example.com",
                    password: hashedPassword,
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
                    role: "productOwner",
                },
                {
                    name: "Jane Manager",
                    email: "jane@example.com",
                    password: hashedPassword,
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
                    role: "projectManager",
                },
                {
                    name: "Bob Manager",
                    email: "bob@example.com",
                    password: hashedPassword,
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
                    role: "projectManager",
                },
                {
                    name: "Alice Developer",
                    email: "alice@example.com",
                    password: hashedPassword,
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
                    role: "teamMember",
                },
                {
                    name: "Charlie Designer",
                    email: "charlie@example.com",
                    password: hashedPassword,
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
                    role: "teamMember",
                },
                {
                    name: "Dave Developer",
                    email: "dave@example.com",
                    password: hashedPassword,
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dave",
                    role: "teamMember",
                },
            ])
            .returning();

        console.log(`✅ Created 7 users with roles\n`);

        // =========================================================================
        // Seed Teams
        // =========================================================================
        console.log("🏢 Creating teams...");
        const [engineeringTeam, designTeam, qaTeam] = await db
            .insert(teams)
            .values([
                {
                    name: "Engineering",
                    description:
                        "Core engineering team responsible for product development",
                },
                {
                    name: "Design",
                    description: "UX/UI design team creating beautiful user experiences",
                },
                {
                    name: "QA",
                    description: "Quality assurance team ensuring product quality",
                },
            ])
            .returning();

        console.log(`✅ Created 3 teams\n`);

        // =========================================================================
        // Seed Team Members
        // =========================================================================
        console.log("👤 Adding team members...");
        await db.insert(teamMembers).values([
            // Engineering team
            { teamId: engineeringTeam.id, userId: projectManager1.id, role: "owner" },
            { teamId: engineeringTeam.id, userId: teamMember1.id, role: "member" },
            { teamId: engineeringTeam.id, userId: teamMember3.id, role: "member" },
            // Design team
            { teamId: designTeam.id, userId: projectManager2.id, role: "owner" },
            { teamId: designTeam.id, userId: teamMember2.id, role: "member" },
            // QA team
            { teamId: qaTeam.id, userId: projectManager1.id, role: "admin" },
            { teamId: qaTeam.id, userId: teamMember3.id, role: "member" },
        ]);
        console.log(`✅ Added 7 team memberships\n`);

        // =========================================================================
        // Seed Projects
        // =========================================================================
        console.log("📁 Creating projects...");
        const [project1, project2, project3] = await db
            .insert(projects)
            .values([
                {
                    name: "Website Redesign",
                    description:
                        "Complete overhaul of the company website with modern design and improved UX",
                    teamId: engineeringTeam.id,
                    ownerId: productOwner.id,
                },
                {
                    name: "Mobile App v2.0",
                    description:
                        "Major update to the mobile application with new features and performance improvements",
                    teamId: engineeringTeam.id,
                    ownerId: productOwner.id,
                },
                {
                    name: "Brand Guidelines",
                    description:
                        "Comprehensive brand identity guidelines and design system documentation",
                    teamId: designTeam.id,
                    ownerId: productOwner.id,
                },
            ])
            .returning();

        console.log(`✅ Created 3 projects\n`);

        // =========================================================================
        // Seed Project-Team Assignments (many-to-many)
        // =========================================================================
        console.log("🔗 Assigning teams to projects...");
        await db.insert(projectTeams).values([
            // Website Redesign - Engineering + Design teams
            { projectId: project1.id, teamId: engineeringTeam.id },
            { projectId: project1.id, teamId: designTeam.id },
            // Mobile App - Engineering + QA teams
            { projectId: project2.id, teamId: engineeringTeam.id },
            { projectId: project2.id, teamId: qaTeam.id },
            // Brand Guidelines - Design team only
            { projectId: project3.id, teamId: designTeam.id },
        ]);
        console.log(`✅ Created 5 project-team assignments\n`);

        // =========================================================================
        // Seed Tasks
        // =========================================================================
        console.log("📋 Creating tasks...");
        const tasksData = await db
            .insert(tasks)
            .values([
                // Website Redesign tasks
                {
                    title: "Design homepage mockup",
                    description:
                        "Create high-fidelity mockup for the new homepage including hero section, features, and footer",
                    status: "done",
                    priority: "high",
                    projectId: project1.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember2.id,
                    dueDate: "2026-02-05",
                    position: 0,
                },
                {
                    title: "Implement responsive navigation",
                    description:
                        "Build responsive navbar with mobile hamburger menu and smooth transitions",
                    status: "in_progress",
                    priority: "high",
                    projectId: project1.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember1.id,
                    dueDate: "2026-02-08",
                    position: 1,
                },
                {
                    title: "Setup CI/CD pipeline",
                    description:
                        "Configure GitHub Actions for automated testing and deployment to staging/production",
                    status: "review",
                    priority: "medium",
                    projectId: project1.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember3.id,
                    dueDate: "2026-02-10",
                    position: 0,
                },
                {
                    title: "Optimize images and assets",
                    description:
                        "Compress images, implement lazy loading, and setup CDN for static assets",
                    status: "todo",
                    priority: "medium",
                    projectId: project1.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember1.id,
                    dueDate: "2026-02-12",
                    position: 0,
                },
                {
                    title: "Write unit tests for components",
                    description:
                        "Add comprehensive unit tests for all React components using Jest and Testing Library",
                    status: "backlog",
                    priority: "low",
                    projectId: project1.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember3.id,
                    dueDate: "2026-02-15",
                    position: 0,
                },
                // Mobile App tasks
                {
                    title: "Implement push notifications",
                    description:
                        "Setup Firebase Cloud Messaging for iOS and Android push notifications",
                    status: "in_progress",
                    priority: "urgent",
                    projectId: project2.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember1.id,
                    dueDate: "2026-02-06",
                    position: 0,
                },
                {
                    title: "Refactor authentication flow",
                    description:
                        "Improve the login/signup flow with biometric authentication support",
                    status: "todo",
                    priority: "high",
                    projectId: project2.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember3.id,
                    dueDate: "2026-02-09",
                    position: 0,
                },
                {
                    title: "Add offline mode support",
                    description:
                        "Implement local storage caching and sync mechanism for offline usage",
                    status: "backlog",
                    priority: "medium",
                    projectId: project2.id,
                    creatorId: projectManager1.id,
                    assigneeId: teamMember1.id,
                    dueDate: "2026-02-20",
                    position: 1,
                },
                // Brand Guidelines tasks
                {
                    title: "Define color palette",
                    description:
                        "Establish primary, secondary, and accent colors with accessibility considerations",
                    status: "done",
                    priority: "high",
                    projectId: project3.id,
                    creatorId: projectManager2.id,
                    assigneeId: teamMember2.id,
                    dueDate: "2026-01-28",
                    position: 0,
                },
                {
                    title: "Create typography guide",
                    description:
                        "Select and document font families, sizes, weights, and usage guidelines",
                    status: "in_progress",
                    priority: "high",
                    projectId: project3.id,
                    creatorId: projectManager2.id,
                    assigneeId: teamMember2.id,
                    dueDate: "2026-02-04",
                    position: 0,
                },
                {
                    title: "Design icon library",
                    description:
                        "Create consistent iconography set for use across all platforms",
                    status: "todo",
                    priority: "medium",
                    projectId: project3.id,
                    creatorId: projectManager2.id,
                    assigneeId: teamMember2.id,
                    dueDate: "2026-02-14",
                    position: 0,
                },
            ])
            .returning();

        console.log(`✅ Created ${tasksData.length} tasks\n`);

        // =========================================================================
        // Seed Task Assignments (multiple assignees per task)
        // =========================================================================
        console.log("👥 Creating task assignments...");
        await db.insert(taskAssignments).values([
            // Task 1: Multiple designers reviewing
            { taskId: tasksData[0].id, userId: teamMember2.id },
            { taskId: tasksData[0].id, userId: projectManager2.id },
            // Task 2: Paired programming
            { taskId: tasksData[1].id, userId: teamMember1.id },
            { taskId: tasksData[1].id, userId: teamMember3.id },
            // Task 3: QA support
            { taskId: tasksData[2].id, userId: teamMember3.id },
            { taskId: tasksData[2].id, userId: teamMember1.id },
            // Task 5: Push notifications team
            { taskId: tasksData[5].id, userId: teamMember1.id },
            { taskId: tasksData[5].id, userId: teamMember3.id },
            // Task 9: Typography with manager review
            { taskId: tasksData[9].id, userId: teamMember2.id },
            { taskId: tasksData[9].id, userId: projectManager2.id },
        ]);
        console.log(`✅ Created 10 task assignments\n`);

        // =========================================================================
        // Seed Comments
        // =========================================================================
        console.log("💬 Creating comments...");
        await db.insert(comments).values([
            // Comments on task 1 (Design homepage mockup)
            {
                content:
                    "I've completed the initial wireframes. Please review when you get a chance!",
                taskId: tasksData[0].id,
                authorId: teamMember2.id,
            },
            {
                content:
                    "Looks great! I love the hero section. Can we add more whitespace around the CTA button?",
                taskId: tasksData[0].id,
                authorId: projectManager1.id,
            },
            {
                content: "Done! Updated the mockup with extra padding. Ready for final review.",
                taskId: tasksData[0].id,
                authorId: teamMember2.id,
            },
            // Comments on task 2 (Implement responsive navigation)
            {
                content:
                    "Started working on this. Should we use a slide-in or dropdown menu for mobile?",
                taskId: tasksData[1].id,
                authorId: teamMember1.id,
            },
            {
                content:
                    "Let's go with slide-in from the left. It feels more modern and works better with our layout.",
                taskId: tasksData[1].id,
                authorId: projectManager1.id,
            },
            // Comments on task 3 (Setup CI/CD pipeline)
            {
                content:
                    "PR is ready for review. I've added deployment to staging on merge to develop branch.",
                taskId: tasksData[2].id,
                authorId: teamMember3.id,
            },
            // Comments on task 6 (Implement push notifications)
            {
                content:
                    "Need access to Firebase console to proceed. @admin can you add me?",
                taskId: tasksData[5].id,
                authorId: teamMember1.id,
            },
            {
                content: "Done! You should have admin access now.",
                taskId: tasksData[5].id,
                authorId: adminUser.id,
            },
            // Comments on task 10 (Create typography guide)
            {
                content:
                    "I'm thinking Inter for body text and Playfair Display for headings. Thoughts?",
                taskId: tasksData[9].id,
                authorId: teamMember2.id,
            },
            {
                content:
                    "Love the combination! Inter is super readable. Let's make sure we have the full weight range.",
                taskId: tasksData[9].id,
                authorId: projectManager2.id,
            },
        ]);
        console.log(`✅ Created 10 comments\n`);

        // =========================================================================
        // Seed Attachments
        // =========================================================================
        console.log("📎 Creating attachments...");
        await db.insert(attachments).values([
            {
                fileName: "homepage-mockup-v1.fig",
                fileUrl: "https://storage.example.com/attachments/homepage-mockup-v1.fig",
                fileSize: 2457600,
                mimeType: "application/figma",
                taskId: tasksData[0].id,
                uploaderId: teamMember2.id,
            },
            {
                fileName: "homepage-mockup-v2.fig",
                fileUrl: "https://storage.example.com/attachments/homepage-mockup-v2.fig",
                fileSize: 2867200,
                mimeType: "application/figma",
                taskId: tasksData[0].id,
                uploaderId: teamMember2.id,
            },
            {
                fileName: "ci-cd-diagram.png",
                fileUrl: "https://storage.example.com/attachments/ci-cd-diagram.png",
                fileSize: 156800,
                mimeType: "image/png",
                taskId: tasksData[2].id,
                uploaderId: teamMember3.id,
            },
            {
                fileName: "color-palette.pdf",
                fileUrl: "https://storage.example.com/attachments/color-palette.pdf",
                fileSize: 524288,
                mimeType: "application/pdf",
                taskId: tasksData[8].id,
                uploaderId: teamMember2.id,
            },
            {
                fileName: "typography-samples.pdf",
                fileUrl: "https://storage.example.com/attachments/typography-samples.pdf",
                fileSize: 1048576,
                mimeType: "application/pdf",
                taskId: tasksData[9].id,
                uploaderId: teamMember2.id,
            },
        ]);
        console.log(`✅ Created 5 attachments\n`);

        // =========================================================================
        // Summary
        // =========================================================================
        console.log("═".repeat(60));
        console.log("🎉 Database seeding completed successfully!");
        console.log("═".repeat(60));
        console.log("\n📊 Summary:");
        console.log("   • 7 users with RBAC roles");
        console.log("   • 3 teams (Engineering, Design, QA)");
        console.log("   • 7 team memberships");
        console.log("   • 3 projects");
        console.log("   • 5 project-team assignments");
        console.log("   • 11 tasks across all statuses");
        console.log("   • 10 task assignments (multiple users per task)");
        console.log("   • 10 comments");
        console.log("   • 5 attachments");
        console.log("\n� Test accounts (password: password123):\n");
        console.log("   ┌─────────────────────────┬─────────────────┐");
        console.log("   │ Email                   │ Role            │");
        console.log("   ├─────────────────────────┼─────────────────┤");
        console.log("   │ admin@example.com       │ admin           │");
        console.log("   │ john@example.com        │ productOwner    │");
        console.log("   │ jane@example.com        │ projectManager  │");
        console.log("   │ bob@example.com         │ projectManager  │");
        console.log("   │ alice@example.com       │ teamMember      │");
        console.log("   │ charlie@example.com     │ teamMember      │");
        console.log("   │ dave@example.com        │ teamMember      │");
        console.log("   └─────────────────────────┴─────────────────┘\n");
        console.log("🔐 Role Hierarchy: teamMember < projectManager < productOwner < admin\n");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    } finally {
        process.exit(0);
    }
}

seed();
