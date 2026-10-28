import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreate, mockHashPassword } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockHashPassword: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: {
      create: mockCreate,
    },
  },
}));

vi.mock("../lib/password.js", () => ({
  hashPassword: mockHashPassword,
}));

import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../lib/app-error.js";
import { registerUser } from "./auth.service.js";

const validInput = {
  email: "capy@example.com",
  password: "A-long-and-unique-passphrase-2026!",
  name: "Capy Family",
};

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHashPassword.mockResolvedValue("$argon2id$test-hash");
  });

  it("hashes the password and creates an unverified user", async () => {
    const createdUser = {
      id: 1,
      email: validInput.email,
      name: validInput.name,
      emailVerifiedAt: null,
      createdAt: new Date("2026-10-28T12:00:00.000Z"),
    };

    mockCreate.mockResolvedValue(createdUser);

    const result = await registerUser(validInput);

    expect(mockHashPassword).toHaveBeenCalledWith(validInput.password);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        email: validInput.email,
        passwordHash: "$argon2id$test-hash",
        name: validInput.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
    expect(result).toEqual(createdUser);
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("creates a user when the optional name is omitted", async () => {
    mockCreate.mockResolvedValue({
      id: 2,
      email: validInput.email,
      name: null,
      emailVerifiedAt: null,
      createdAt: new Date("2026-10-28T12:00:00.000Z"),
    });

    await registerUser({
      email: validInput.email,
      password: validInput.password,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: validInput.email,
          passwordHash: "$argon2id$test-hash",
        },
      }),
    );
  });

  it("converts a duplicate-email database error to an AppError", async () => {
    mockCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["email"] },
      }),
    );

    await expect(registerUser(validInput)).rejects.toMatchObject({
      name: "AppError",
      statusCode: 409,
      code: "EMAIL_ALREADY_REGISTERED",
    });
  });

  it("propagates unexpected database errors", async () => {
    const databaseError = new Error("Database unavailable");
    mockCreate.mockRejectedValue(databaseError);

    await expect(registerUser(validInput)).rejects.toBe(databaseError);
  });

  it("does not access the database if password hashing fails", async () => {
    const hashingError = new Error("Hashing failed");
    mockHashPassword.mockRejectedValue(hashingError);

    await expect(registerUser(validInput)).rejects.toBe(hashingError);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
