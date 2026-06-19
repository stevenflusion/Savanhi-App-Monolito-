import type { AppSupabaseClient } from "../../supabase/clients.js";

export function createAuthLogsRepository(db: AppSupabaseClient) {
  return {
    async recordRegister(event: { userId: string; email: string }): Promise<void> {
      const { error } = await db.from("register").insert({
        user_id: event.userId,
        email: event.email,
      });

      if (error) console.warn("Unable to record register event.", error.message);
    },

    async recordLogin(event: { userId: string; email: string }): Promise<void> {
      const { error } = await db.from("login").insert({
        user_id: event.userId,
        email: event.email,
      });

      if (error) console.warn("Unable to record login event.", error.message);
    },
  };
}
