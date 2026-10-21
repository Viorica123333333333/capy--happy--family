import { rateLimit } from "express-rate-limit";

interface RateLimiterOptions {
  limit?: number;
}

export function createRateLimiter({ limit = 100 }: RateLimiterOptions = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      });
    },
  });
}

export const apiRateLimiter = createRateLimiter();
