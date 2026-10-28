import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { verifyPassword } from "./lib/password.js";

const testEmail = `integration-${crypto.randomUUID()}@example.com`;
const testPassword = "Integration-test-passphrase-2026!";

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: testEmail },
  });

  await prisma.$disconnect();
});

describe("Registration integration", () => {
  it("creates an unverified user with an Argon2id password hash", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: testEmail,
        password: testPassword,
        name: "Integration Test",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.user).toMatchObject({
      email: testEmail,
      name: "Integration Test",
      emailVerifiedAt: null,
    });
    expect(response.body.data.user).not.toHaveProperty("passwordHash");

    const storedUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    expect(storedUser).not.toBeNull();

    if (!storedUser) {
      throw new Error("Expected registration to create a database user.");
    }

    expect(storedUser.passwordHash).toMatch(/^\$argon2id\$/);
    expect(storedUser.passwordHash).not.toBe(testPassword);
    expect(await verifyPassword(testPassword, storedUser.passwordHash)).toBe(
      true,
    );
    expect(storedUser.emailVerifiedAt).toBeNull();
  });

  it("rejects a duplicate email without creating another user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: testEmail,
        password: testPassword,
        name: "Duplicate Test",
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");

    const matchingUsers = await prisma.user.count({
      where: { email: testEmail },
    });

    expect(matchingUsers).toBe(1);
  });
});
