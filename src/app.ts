import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
// Swagger
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { teamRoutes } from "./routes/team.routes.js";
import { projectRoutes } from "./routes/project.routes.js";
import { projectTeamRoutes } from "./routes/projectTeam.routes.js";
import { taskRoutes } from "./routes/task.routes.js";
import { taskAssignmentRoutes } from "./routes/taskAssignment.routes.js";
import { commentRoutes } from "./routes/comment.routes.js";
import { attachmentRoutes } from "./routes/attachment.routes.js";
import { uploadRoutes } from "./routes/upload.routes.js";
import { notificationRoutes } from "./routes/notification.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import path from "path";

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration - Allow credentials for HttpOnly cookies
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser - for reading HttpOnly cookies
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));
}

const mountApiRoutes = (prefix: string) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/teams`, teamRoutes);
  app.use(`${prefix}/projects`, projectRoutes);
  app.use(`${prefix}/project-teams`, projectTeamRoutes);
  app.use(`${prefix}/tasks`, taskRoutes);
  app.use(`${prefix}/task-assignments`, taskAssignmentRoutes);
  app.use(prefix, commentRoutes);
  app.use(prefix, attachmentRoutes);
  app.use(`${prefix}/upload`, uploadRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
};

// Routes
mountApiRoutes("/api");
mountApiRoutes("/api/v1");

// Static file serving for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health Check Route
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to Project Manager API",
  });
});

// Error Handler
app.use(errorHandler);

export { app };
