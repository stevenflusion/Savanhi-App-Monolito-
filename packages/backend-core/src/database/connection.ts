import {
  createSupabaseAnonClient,
  createSupabaseServiceClient,
  createSupabaseUserClient,
  type AppSupabaseClient,
} from "../supabase/clients.js";
import type { BackendEnv } from "../types/env.js";

export type DatabaseConnection = {
  anon: AppSupabaseClient;
  service: AppSupabaseClient;
  forUser: (accessToken: string) => AppSupabaseClient;
};

export function createDatabaseConnection(env: BackendEnv): DatabaseConnection {
  return {
    anon: createSupabaseAnonClient(env),
    service: createSupabaseServiceClient(env),
    forUser: (accessToken) => createSupabaseUserClient(env, accessToken),
  };
}
