import express from "express";
import { prisma } from "./lib/prisma.js";
import { validateBody } from "./middleware/validate-body.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthCheckSchema } from "./schemas/health-check.schema.js";

const app = express();

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
  });
});

app.get("/api/health/db", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    response.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.post(
  "/api/health/validate",
  validateBody(healthCheckSchema),
  (_request, response) => {
    response.json({
      status: "ok",
      data: _request.body,
    });
  },
);

app.use(errorHandler);

export default app;
