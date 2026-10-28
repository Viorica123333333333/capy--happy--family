import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";

const { mockRegisterUser } = vi.hoisted(() => ({
  mockRegisterUser: vi.fn(),
}));

vi.mock("./services/auth.service.js", () => ({
  registerUser: mockRegisterUser,
}));

import app from "./app.js";
import { AppError } from "./lib/app-error.js";
import { createRateLimiter } from "./middleware/rate-limiter.js";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user and returns only public fields", async () => {
    mockRegisterUser.mockResolvedValue({
      id: 1,
      email: "capy@example.com",
      name: "Capy Family",
      emailVerifiedAt: null,
      createdAt: new Date("2026-10-28T12:00:00.000Z"),
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "capy@example.com",
        password: "A-long-and-unique-passphrase-2026!",
        name: "Capy Family",
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "ok",
      data: {
        user: {
          id: 1,
          email: "capy@example.com",
          name: "Capy Family",
          emailVerifiedAt: null,
        },
      },
    });
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
    expect(response.body.data.user).not.toHaveProperty("password");
    expect(mockRegisterUser).toHaveBeenCalledWith({
      email: "capy@example.com",
      password: "A-long-and-unique-passphrase-2026!",
      name: "Capy Family",
    });
  });

  it("rejects invalid registration input", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "not-an-email",
        password: "short",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it("rejects unexpected fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "capy@example.com",
        password: "A-long-and-unique-passphrase-2026!",
        isAdmin: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it("returns a controlled error for duplicate email addresses", async () => {
    mockRegisterUser.mockRejectedValue(
      new AppError(
        "An account with this email address already exists.",
        409,
        "EMAIL_ALREADY_REGISTERED",
      ),
    );

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "capy@example.com",
        password: "A-long-and-unique-passphrase-2026!",
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });

  it("returns a generic error for unexpected failures", async () => {
    mockRegisterUser.mockRejectedValue(
      new Error("Sensitive internal database details"),
    );

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "capy@example.com",
        password: "A-long-and-unique-passphrase-2026!",
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    });
    expect(JSON.stringify(response.body)).not.toContain(
      "Sensitive internal database details",
    );
  });
});

describe("POST /api/health/validate", () => {
  it("accepts a valid message", async () => {
    const response = await request(app)
      .post("/api/health/validate")
      .send({ message: "Hello, Capy!" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      data: { message: "Hello, Capy!" },
    });
  });

  it("rejects an empty message", async () => {
    const response = await request(app)
      .post("/api/health/validate")
      .send({ message: "" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a missing message", async () => {
    const response = await request(app).post("/api/health/validate").send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a message longer than 100 characters", async () => {
    const response = await request(app)
      .post("/api/health/validate")
      .send({ message: "a".repeat(101) });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects malformed JSON", async () => {
    const response = await request(app)
      .post("/api/health/validate")
      .set("Content-Type", "application/json")
      .send('{"message":');

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual({
      code: "INVALID_JSON",
      message: "The request body contains invalid JSON.",
    });
  });

  it("rejects JSON bodies larger than 100 KB", async () => {
    const response = await request(app)
      .post("/api/health/validate")
      .send({ message: "a".repeat(101 * 1024) });

    expect(response.status).toBe(413);
  });
});

describe("GET /api/health", () => {
  it("includes Helmet security headers", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });
});

describe("API rate limiting", () => {
  it("returns 429 when the request limit is exceeded", async () => {
    const rateLimitedApp = express();

    rateLimitedApp.use("/api", createRateLimiter({ limit: 2 }));
    rateLimitedApp.get("/api/health", (_request, response) => {
      response.json({ status: "ok" });
    });

    const firstResponse = await request(rateLimitedApp).get("/api/health");
    const secondResponse = await request(rateLimitedApp).get("/api/health");
    const thirdResponse = await request(rateLimitedApp).get("/api/health");

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(thirdResponse.status).toBe(429);
    expect(thirdResponse.body.error).toEqual({
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
    });
  });
});

describe("CORS configuration", () => {
  it("allows the configured frontend origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("does not grant CORS access to an unapproved origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://untrusted.example");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("handles preflight requests", async () => {
    const response = await request(app)
      .options("/api/health")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
  });
});
