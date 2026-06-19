import { Router, type Router as ExpressRouter } from "express";
import type { BackendEnv } from "./types/env.js";

export function createHealthRouter(env: BackendEnv): ExpressRouter {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).json({
      service: env.serviceName,
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/api/v1/ping", (_req, res) => {
    res.status(200).json({ message: "pong", service: env.serviceName });
  });

  return router;
}
