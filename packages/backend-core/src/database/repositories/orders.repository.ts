import type { CreateOrderRequest, OrderStatus } from "@repo/api-contracts/orders";
import { ORDER_STATUSES } from "@repo/api-contracts/orders";
import { AppError } from "../../errors.js";
import type { AppSupabaseClient } from "../../supabase/clients.js";
import { mapOrder } from "../../supabase/mappers.js";

export function createOrdersRepository(db: AppSupabaseClient) {
  return {
    async createForClient(clientProfileId: string, payload: CreateOrderRequest) {
      const productIds = payload.items.map((item) => item.productId);
      const { data: products, error: productsError } = await db
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("active", true);

      if (productsError) throw new AppError(productsError.message, 502, productsError);
      if (products.length !== productIds.length) throw new AppError("One or more products are unavailable.", 409);

      const total = payload.items.reduce((sum, item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return sum + Number(product?.price ?? 0) * item.quantity;
      }, 0);

      const { data: order, error: orderError } = await db
        .from("orders")
        .insert({
          client_user_id: clientProfileId,
          store_id: payload.storeId,
          status: "pending",
          total,
        })
        .select()
        .single();

      if (orderError) throw new AppError(orderError.message, 502, orderError);

      const items = payload.items.map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return {
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: Number(product?.price ?? 0),
        };
      });

      const { error: itemsError } = await db.from("order_items").insert(items);
      if (itemsError) throw new AppError(itemsError.message, 502, itemsError);

      return mapOrder(order);
    },

    async listByClient(clientProfileId: string) {
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("client_user_id", clientProfileId)
        .order("created_at", { ascending: false });

      if (error) throw new AppError(error.message, 502, error);
      return data.map(mapOrder);
    },

    async findByClient(id: string, clientProfileId: string) {
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("client_user_id", clientProfileId)
        .single();

      if (error) throw new AppError(error.message, 404, error);
      return mapOrder(data);
    },

    async cancelByClient(id: string, clientProfileId: string) {
      const cancellableStatuses = ORDER_STATUSES.filter((status) => status !== "delivered" && status !== "cancelled");
      const { data, error } = await db
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("client_user_id", clientProfileId)
        .in("status", cancellableStatuses)
        .select()
        .single();

      if (error) throw new AppError(error.message, 409, error);
      return mapOrder(data);
    },

    async listByStoreIds(storeIds: string[]) {
      if (!storeIds.length) return [];

      const { data, error } = await db
        .from("orders")
        .select("*")
        .in("store_id", storeIds)
        .order("created_at", { ascending: false });

      if (error) throw new AppError(error.message, 502, error);
      return data.map(mapOrder);
    },

    async updateStatusForStores(id: string, storeIds: string[], status: OrderStatus) {
      const { data, error } = await db
        .from("orders")
        .update({ status })
        .eq("id", id)
        .in("store_id", storeIds)
        .select()
        .single();

      if (error) throw new AppError(error.message, 404, error);
      return mapOrder(data);
    },

    async count(): Promise<number> {
      const { count, error } = await db.from("orders").select("id", { count: "exact", head: true });
      if (error) throw new AppError(error.message, 502, error);
      return count ?? 0;
    },
  };
}
