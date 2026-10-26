import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";

describe("password hashing", () => {
  it("hashes passwords and verifies the correct password", async () => {
    const password = "A-long-and-unique-passphrase-2026!";
    const passwordHash = await hashPassword(password);

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    expect(passwordHash).not.toBe(password);

    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
    await expect(
      verifyPassword("a-different-password", passwordHash),
    ).resolves.toBe(false);
  });

  it("supports Unicode passwords without modifying them", async () => {
    const password = "Capybara-家庭-🔐-passphrase";
    const passwordHash = await hashPassword(password);

    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
  });

  it("rejects empty passwords when hashing", async () => {
    await expect(hashPassword("")).rejects.toThrow(
      "Password must not be empty.",
    );
  });

  it("rejects passwords exceeding the byte limit", async () => {
    const password = "a".repeat(1_025);

    await expect(hashPassword(password)).rejects.toThrow(
      "Password exceeds the maximum permitted length.",
    );
  });

  it("does not authenticate malformed or unsupported hashes", async () => {
    await expect(verifyPassword("some-password", "not-a-valid-hash"))
      .resolves.toBe(false);

    await expect(verifyPassword("some-password", "$argon2id$invalid"))
      .resolves.toBe(false);
  });

  it("does not authenticate an empty password", async () => {
    const passwordHash = await hashPassword("a-valid-passphrase");

    await expect(verifyPassword("", passwordHash)).resolves.toBe(false);
  });
});
