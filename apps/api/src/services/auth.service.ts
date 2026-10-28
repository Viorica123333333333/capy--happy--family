import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/app-error.js";
import { hashPassword } from "../lib/password.js";
import type { RegisterInput } from "../schemas/register.schema.js";

export async function registerUser(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        ...(input.name !== undefined ? { name: input.name } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "An account with this email address already exists.",
        409,
        "EMAIL_ALREADY_REGISTERED",
      );
    }

    throw error;
  }
}
