import { createSupabaseAuthService } from "../auth/service.js";
import { createDatabaseConnection, type DatabaseConnection } from "../database/connection.js";
import { createAuthLogsRepository } from "../database/repositories/auth-logs.repository.js";
import { createBrandsRepository } from "../database/repositories/brands.repository.js";
import { createDeliveriesRepository } from "../database/repositories/deliveries.repository.js";
import { createOrdersRepository } from "../database/repositories/orders.repository.js";
import { createProductsRepository } from "../database/repositories/products.repository.js";
import { createStoresRepository } from "../database/repositories/stores.repository.js";
import { createUsersRepository } from "../database/repositories/users.repository.js";
import type { AuthRole } from "@repo/api-contracts/auth";
import type { BackendEnv } from "../types/env.js";

export type BackendRepositories = {
  authLogs: ReturnType<typeof createAuthLogsRepository>;
  users: ReturnType<typeof createUsersRepository>;
  brands: ReturnType<typeof createBrandsRepository>;
  stores: ReturnType<typeof createStoresRepository>;
  products: ReturnType<typeof createProductsRepository>;
  orders: ReturnType<typeof createOrdersRepository>;
  deliveries: ReturnType<typeof createDeliveriesRepository>;
};

export type BackendContext = {
  env: BackendEnv;
  db: DatabaseConnection;
  authService: ReturnType<typeof createSupabaseAuthService>;
  repositories: BackendRepositories;
};

export function createBackendContext(
  env: BackendEnv,
  { defaultRegistrationRole = "tendero" as AuthRole } = {}
): BackendContext {
  const db = createDatabaseConnection(env);
  const repositories = {
    authLogs: createAuthLogsRepository(db.service),
    users: createUsersRepository(db.service),
    brands: createBrandsRepository(db.service),
    stores: createStoresRepository(db.service),
    products: createProductsRepository(db.service),
    orders: createOrdersRepository(db.service),
    deliveries: createDeliveriesRepository(db.service),
  };

  return {
    env,
    db,
    authService: createSupabaseAuthService(db, {
      defaultRegistrationRole,
      authLogs: repositories.authLogs,
      users: repositories.users,
    }),
    repositories,
  };
}
