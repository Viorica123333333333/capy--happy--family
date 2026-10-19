import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
app.use(express.json());
const port = env.PORT;

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

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
