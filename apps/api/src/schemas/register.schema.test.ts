import { describe, expect, it } from "vitest";
import { registerSchema } from "./register.schema.js";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "capy@example.com",
      password: "A-long-and-unique-passphrase-2026!",
      name: "Capy Family",
    });

    expect(result.success).toBe(true);
  });

  it("normalizes email casing and surrounding whitespace", () => {
    const result = registerSchema.safeParse({
      email: "  CAPY@EXAMPLE.COM  ",
      password: "A-long-and-unique-passphrase-2026!",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("capy@example.com");
    }
  });

  it("allows an omitted name", () => {
    const result = registerSchema.safeParse({
      email: "capy@example.com",
      password: "A-long-and-unique-passphrase-2026!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(
      registerSchema.safeParse({
        email: "not-an-email",
        password: "A-long-and-unique-passphrase-2026!",
      }).success,
    ).toBe(false);
  });

  it("rejects passwords shorter than 15 characters", () => {
    expect(
      registerSchema.safeParse({
        email: "capy@example.com",
        password: "Short123!",
      }).success,
    ).toBe(false);
  });

  it("rejects passwords exceeding 1024 UTF-8 bytes", () => {
    expect(
      registerSchema.safeParse({
        email: "capy@example.com",
        password: "🔐".repeat(257),
      }).success,
    ).toBe(false);
  });

  it("rejects an empty supplied name", () => {
    expect(
      registerSchema.safeParse({
        email: "capy@example.com",
        password: "A-long-and-unique-passphrase-2026!",
        name: "   ",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown field", () => {
    expect(
      registerSchema.safeParse({
        email: "capy@example.com",
        password: "A-long-and-unique-passphrase-2026!",
        isAdmin: true,
      }).success,
    ).toBe(false);
  });
});
