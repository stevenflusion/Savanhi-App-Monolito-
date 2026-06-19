import type { ProductRequest } from "@repo/api-contracts/products";
import { AppError } from "../../errors.js";
import type { AppSupabaseClient } from "../../supabase/clients.js";
import { mapProduct } from "../../supabase/mappers.js";

export function createProductsRepository(db: AppSupabaseClient) {
  return {
    async listActive() {
      const { data, error } = await db
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw new AppError(error.message, 502, error);
      return data.map(mapProduct);
    },

    async findActiveById(id: string) {
      const { data, error } = await db.from("products").select("*").eq("id", id).eq("active", true).single();
      if (error) throw new AppError(error.message, 404, error);
      return mapProduct(data);
    },

    async listRowsByIds(productIds: string[]) {
      const { data, error } = await db.from("products").select("*").in("id", productIds).eq("active", true);
      if (error) throw new AppError(error.message, 502, error);
      return data;
    },

    async listByStoreIds(storeIds: string[]) {
      if (!storeIds.length) return [];

      const { data, error } = await db
        .from("products")
        .select("*")
        .in("store_id", storeIds)
        .order("created_at", { ascending: false });

      if (error) throw new AppError(error.message, 502, error);
      return data.map(mapProduct);
    },

    async createForStore(storeId: string, payload: ProductRequest) {
      const { data, error } = await db
        .from("products")
        .insert({
          store_id: storeId,
          brand_id: payload.brandId ?? null,
          name: payload.name,
          description: payload.description ?? null,
          price: payload.price,
          stock: payload.stock ?? 0,
          active: payload.active ?? true,
        })
        .select()
        .single();

      if (error) throw new AppError(error.message, 502, error);
      return mapProduct(data);
    },

    async updateForStores(id: string, storeIds: string[], payload: Partial<ProductRequest>) {
      const { data, error } = await db
        .from("products")
        .update({
          store_id: payload.storeId,
          brand_id: payload.brandId,
          name: payload.name,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          active: payload.active,
        })
        .eq("id", id)
        .in("store_id", storeIds)
        .select()
        .single();

      if (error) throw new AppError(error.message, 404, error);
      return mapProduct(data);
    },

    async deactivateForStores(id: string, storeIds: string[]) {
      const { data, error } = await db
        .from("products")
        .update({ active: false })
        .eq("id", id)
        .in("store_id", storeIds)
        .select()
        .single();

      if (error) throw new AppError(error.message, 404, error);
      return mapProduct(data);
    },

    async count(): Promise<number> {
      const { count, error } = await db.from("products").select("id", { count: "exact", head: true });
      if (error) throw new AppError(error.message, 502, error);
      return count ?? 0;
    },
  };
}
