import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "./app.js";

describe("POST /api/health/validate", () => {
  it("accepts a valid message", async () => {
    const response = await request(app)
      .post("/api/health/validate")
      .send({ message: "Hello, Capy!" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      data: {
        message: "Hello, Capy!",
      },
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
});
