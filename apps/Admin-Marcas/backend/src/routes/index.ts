import type { AuthRole } from "@repo/api-contracts/auth";
import {
  type BackendContext,
  validateBody,
  validateParams,
} from "@repo/backend-core";
import { Router, type RequestHandler, type Router as ExpressRouter } from "express";
import { z } from "zod";

const idParamsSchema = z.object({ id: z.string().uuid() });
const userStatusSchema = z.object({ active: z.boolean() });
const brandSchema = z.object({
  name: z.string().min(1),
  ownerProfileId: z.string().uuid().nullable().optional(),
  active: z.boolean().optional(),
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
  const { brands, deliveries, orders, products, stores, users } = context.repositories;
  const adminOnly = requireRole(["admin"]);

  router.get("/api/v1/admin/status", (_req, res) => {
    res.status(200).json({
      section: "Admin-Marcas",
      backend: "admin-marcas-backend",
      status: "ready",
    });
  });

  router.get("/api/v1/admin/users", adminOnly, async (_req, res, next) => {
    try {
      const data = await users.listAdminUsers();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch(
    "/api/v1/admin/users/:id/status",
    adminOnly,
    validateParams(idParamsSchema),
    validateBody(userStatusSchema),
    async (req, res, next) => {
      try {
        const data = await users.updateStatus(String(req.params.id), req.body);
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/api/v1/admin/brands", adminOnly, async (_req, res, next) => {
    try {
      const data = await brands.list();
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.post("/api/v1/admin/brands", adminOnly, validateBody(brandSchema), async (req, res, next) => {
    try {
      const data = await brands.create(req.body);
      res.status(201).json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch(
    "/api/v1/admin/brands/:id",
    adminOnly,
    validateParams(idParamsSchema),
    validateBody(brandSchema.partial()),
    async (req, res, next) => {
      try {
        const data = await brands.update(String(req.params.id), req.body);
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/api/v1/admin/reports/overview", adminOnly, async (_req, res, next) => {
    try {
      const [usersCount, brandsCount, storesCount, productsCount, ordersCount, deliveriesCount] = await Promise.all([
        users.count(),
        brands.count(),
        stores.count(),
        products.count(),
        orders.count(),
        deliveries.count(),
      ]);

      res.status(200).json({
        data: {
          users: usersCount,
          brands: brandsCount,
          stores: storesCount,
          products: productsCount,
          orders: ordersCount,
          deliveries: deliveriesCount,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
