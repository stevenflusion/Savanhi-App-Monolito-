import type { DeliveryStatus } from "@repo/api-contracts/deliveries";
import { AppError } from "../../errors.js";
import type { AppSupabaseClient } from "../../supabase/clients.js";
import { mapDelivery } from "../../supabase/mappers.js";

export function createDeliveriesRepository(db: AppSupabaseClient) {
  return {
    async listAssigned(deliveryProfileId: string) {
      const { data, error } = await db
        .from("deliveries")
        .select("*")
        .eq("delivery_user_id", deliveryProfileId)
        .order("created_at", { ascending: false });

      if (error) throw new AppError(error.message, 502, error);
      return data.map(mapDelivery);
    },

    async updateStatusByOrder(orderId: string, deliveryProfileId: string, status: DeliveryStatus) {
      const { data, error } = await db
        .from("deliveries")
        .update({ status })
        .eq("order_id", orderId)
        .eq("delivery_user_id", deliveryProfileId)
        .select()
        .single();

      if (error) throw new AppError(error.message, 404, error);
      return mapDelivery(data);
    },

    async listToday(deliveryProfileId: string) {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await db
        .from("deliveries")
        .select("*")
        .eq("delivery_user_id", deliveryProfileId)
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lte("created_at", `${today}T23:59:59.999Z`)
        .order("created_at", { ascending: true });

      if (error) throw new AppError(error.message, 502, error);
      return data.map(mapDelivery);
    },

    async count(): Promise<number> {
      const { count, error } = await db.from("deliveries").select("id", { count: "exact", head: true });
      if (error) throw new AppError(error.message, 502, error);
      return count ?? 0;
    },
  };
}
