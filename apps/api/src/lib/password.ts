import * as argon2 from "argon2";

const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

const MAX_PASSWORD_BYTES = 1_024;

function assertValidPasswordInput(password: string): void {
  if (password.length === 0) {
    throw new Error("Password must not be empty.");
  }

  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    throw new Error("Password exceeds the maximum permitted length.");
  }
}

export async function hashPassword(password: string): Promise<string> {
  assertValidPasswordInput(password);

  return argon2.hash(password, PASSWORD_HASH_OPTIONS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (
    password.length === 0 ||
    Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES ||
    !passwordHash.startsWith("$argon2id$")
  ) {
    return false;
  }

  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    // Malformed or unsupported stored hashes must never authenticate.
    return false;
  }
}
