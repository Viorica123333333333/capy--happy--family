import type { ErrorRequestHandler } from "express";
import { AppError } from "../lib/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    response.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "The request body contains invalid JSON.",
      },
    });
    return;
  }

  console.error("Unhandled API error:", error);

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
};
