import type { AuthRole } from "@repo/api-contracts/auth";
import {
  type BackendContext,
  validateBody,
  validateParams,
} from "@repo/backend-core";
import { Router, type RequestHandler, type Router as ExpressRouter } from "express";
import { z } from "zod";

const idParamsSchema = z.object({ id: z.string().uuid() });
const createOrderSchema = z.object({
  storeId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() })).min(1),
});

type RequireRole = (roles: AuthRole[]) => RequestHandler;

export function createApiRouter({
  context,
  requireRole,
}: {
  context: BackendContext;
  requireRole: RequireRole;
}): ExpressRouter {
  const router = Router();
  const { orders, products } = context.repositories;

  router.get("/api/v1/clients/status", (_req, res) => {
    res.status(200).json({
      section: "Clients",
      backend: "clients-backend",
      status: "ready",
    });
  });

  router.get("/api/v1/clients/catalog/products", async (_req, res, next) => {
    try {
      const data = await products.listActive();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/api/v1/clients/catalog/products/:id", validateParams(idParamsSchema), async (req, res, next) => {
    try {
      const data = await products.findActiveById(String(req.params.id));
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/api/v1/clients/orders",
    requireRole(["client"]),
    validateBody(createOrderSchema),
    async (req, res, next) => {
      try {
        const data = await orders.createForClient(req.auth?.user.id ?? "", req.body);
        res.status(201).json({ data });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/api/v1/clients/orders", requireRole(["client"]), async (req, res, next) => {
    try {
      const data = await orders.listByClient(req.auth?.user.id ?? "");
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/api/v1/clients/orders/:id", requireRole(["client"]), validateParams(idParamsSchema), async (req, res, next) => {
    try {
      const data = await orders.findByClient(String(req.params.id), req.auth?.user.id ?? "");
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch(
    "/api/v1/clients/orders/:id/cancel",
    requireRole(["client"]),
    validateParams(idParamsSchema),
    async (req, res, next) => {
      try {
        const data = await orders.cancelByClient(String(req.params.id), req.auth?.user.id ?? "");
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
