import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BackendEnv } from "../types/env.js";

export type AppSupabaseClient = SupabaseClient;

const authOptions = {
  persistSession: false,
  autoRefreshToken: false,
} as const;

export function createSupabaseAnonClient(env: BackendEnv): AppSupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: authOptions,
  });
}

export function createSupabaseServiceClient(env: BackendEnv): AppSupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: authOptions,
  });
}

export function createSupabaseUserClient(env: BackendEnv, accessToken: string): AppSupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: authOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
