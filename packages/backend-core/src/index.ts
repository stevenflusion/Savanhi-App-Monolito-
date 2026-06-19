export { createBackendApp } from "./app.js";
export { createAuthRouter, createRequireAuth, createRequireRole } from "./auth/router.js";
export { createSupabaseAuthService } from "./auth/service.js";
export type { SupabaseAuthService } from "./auth/service.js";
export { createBackendContext } from "./context/backend-context.js";
export type { BackendContext, BackendRepositories } from "./context/backend-context.js";
export { createDatabaseConnection } from "./database/connection.js";
export type { DatabaseConnection } from "./database/connection.js";
export { createAuthLogsRepository } from "./database/repositories/auth-logs.repository.js";
export { createBrandsRepository } from "./database/repositories/brands.repository.js";
export { createDeliveriesRepository } from "./database/repositories/deliveries.repository.js";
export { createOrdersRepository } from "./database/repositories/orders.repository.js";
export { createProductsRepository } from "./database/repositories/products.repository.js";
export { createStoresRepository } from "./database/repositories/stores.repository.js";
export { createUsersRepository } from "./database/repositories/users.repository.js";
export { createEnv } from "./env.js";
export { AppError, createErrorHandler, notFoundHandler } from "./errors.js";
export { createHealthRouter } from "./health-router.js";
export { validateBody, validateParams, validateQuery } from "./middleware/validation.js";
export { AUTH_ROLES, isAuthRole, normalizeRole } from "./roles.js";
export {
  createSupabaseAnonClient,
  createSupabaseServiceClient,
  createSupabaseUserClient,
} from "./supabase/clients.js";
export type { AppSupabaseClient } from "./supabase/clients.js";
export {
  mapAdminUser,
  mapBrand,
  mapDelivery,
  mapOrder,
  mapProduct,
  mapProfile,
  mapStore,
} from "./supabase/mappers.js";
export type { Database } from "./types/database.js";
export type { BackendEnv } from "./types/env.js";
