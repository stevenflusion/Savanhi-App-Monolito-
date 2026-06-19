import type { AuthRole } from "@repo/api-contracts/auth";
import { DELIVERY_STATUSES } from "@repo/api-contracts/deliveries";
import {
  type BackendContext,
  validateBody,
  validateParams,
} from "@repo/backend-core";
import { Router, type RequestHandler, type Router as ExpressRouter } from "express";
import { z } from "zod";

const idParamsSchema = z.object({ id: z.string().uuid() });
const deliveryStatusSchema = z.object({
  status: z.enum(DELIVERY_STATUSES),
});
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
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
  const { deliveries } = context.repositories;
  const deliveryOnly = requireRole(["delivery"]);

  router.get("/api/v1/delivery/status", (_req, res) => {
    res.status(200).json({
      section: "Delivery",
      backend: "delivery-backend",
      status: "ready",
    });
  });

  router.get("/api/v1/delivery/orders/assigned", deliveryOnly, async (req, res, next) => {
    try {
      const data = await deliveries.listAssigned(req.auth?.user.id ?? "");
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch(
    "/api/v1/delivery/orders/:id/status",
    deliveryOnly,
    validateParams(idParamsSchema),
    validateBody(deliveryStatusSchema),
    async (req, res, next) => {
      try {
        const data = await deliveries.updateStatusByOrder(String(req.params.id), req.auth?.user.id ?? "", req.body.status);
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/api/v1/delivery/routes/today", deliveryOnly, async (req, res, next) => {
    try {
      const data = await deliveries.listToday(req.auth?.user.id ?? "");
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/api/v1/delivery/location", deliveryOnly, validateBody(locationSchema), (req, res) => {
    res.status(200).json({
      data: {
        deliveryProfileId: req.auth?.user.id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        receivedAt: new Date().toISOString(),
      },
    });
  });

  return router;
}
