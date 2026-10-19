import { z } from "zod";

export const healthCheckSchema = z.object({
  message: z.string().min(1).max(100),
});
