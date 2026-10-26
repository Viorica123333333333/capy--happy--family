import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email().max(254)),

    password: z
      .string()
      .min(15, "Password must be at least 15 characters long.")
      .max(1024, "Password exceeds the maximum permitted length.")
      .refine(
        (password) => Buffer.byteLength(password, "utf8") <= 1024,
        "Password exceeds the maximum permitted length.",
      ),

    name: z
      .string()
      .trim()
      .min(1, "Name must not be empty.")
      .max(100, "Name must be at most 100 characters long.")
      .optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
