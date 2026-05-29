import { Router } from "express";

import { healthCheckController, pingController } from "../controllers/health-controller.js";

export const healthRouter = Router();

healthRouter.get("/health", healthCheckController);
healthRouter.get("/api/v1/ping", pingController);
