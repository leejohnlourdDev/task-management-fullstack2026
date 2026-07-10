import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.ts";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    console.error("ApiError:", err.status, err.message, err.stack);
    return res.status(err.status).json({
      status: err.status,
      error: err.message,
    });
  }

  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
      ? err
      : JSON.stringify(err, Object.getOwnPropertyNames(err)) || "Internal server error";

  console.error("Unhandled error:", err);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }

  res.status(500).json({
    status: 500,
    error: message,
  });
};
