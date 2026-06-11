import { env } from "../config/env.js";

export function errorHandler(error, _req, res, _next) {
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  const payload = {
    error: message,
  };

  if (env.nodeEnv !== "production" && statusCode === 500) {
    payload.details = error?.message ?? "Unknown error";
  }

  res.status(statusCode).json(payload);
}
