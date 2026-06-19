import type { BrandRequest } from "@repo/api-contracts/users";
import { AppError } from "../../errors.js";
import type { AppSupabaseClient } from "../../supabase/clients.js";
import { mapBrand } from "../../supabase/mappers.js";

export function createBrandsRepository(db: AppSupabaseClient) {
  return {
    async list() {
      const { data, error } = await db.from("brands").select("*").order("created_at", { ascending: false });
      if (error) throw new AppError(error.message, 502, error);
      return data.map(mapBrand);
    },

    async create(payload: BrandRequest) {
      const { data, error } = await db
        .from("brands")
        .insert({
          name: payload.name,
          owner_user_id: payload.ownerProfileId ?? null,
          active: payload.active ?? true,
        })
        .select()
        .single();

      if (error) throw new AppError(error.message, 502, error);
      return mapBrand(data);
    },

    async update(id: string, payload: Partial<BrandRequest>) {
      const { data, error } = await db
        .from("brands")
        .update({
          name: payload.name,
          owner_user_id: payload.ownerProfileId,
          active: payload.active,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 404, error);
      return mapBrand(data);
    },

    async count(): Promise<number> {
      const { count, error } = await db.from("brands").select("id", { count: "exact", head: true });
      if (error) throw new AppError(error.message, 502, error);
      return count ?? 0;
    },
  };
}
