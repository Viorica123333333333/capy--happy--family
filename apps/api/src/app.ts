import express from "express";
import { prisma } from "./lib/prisma.js";
import { validateBody } from "./middleware/validate-body.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthCheckSchema } from "./schemas/health-check.schema.js";
import helmet from "helmet";
import { apiRateLimiter } from "./middleware/rate-limiter.js";
import cors from "cors";
import { env } from "./config/env.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.FRONTEND_ORIGIN) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use("/api", apiRateLimiter);

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
