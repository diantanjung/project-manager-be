import express from "express";
import cors from "cors";
import helmet from "helmet";
// Swagger
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health Check Route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Project Manager API",
  });
});

// Error Handler
app.use(errorHandler);

export { app };
