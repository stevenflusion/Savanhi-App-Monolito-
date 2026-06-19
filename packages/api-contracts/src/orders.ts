export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "assigned",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItemRequest = {
  productId: string;
  quantity: number;
};

export type CreateOrderRequest = {
  storeId: string;
  items: OrderItemRequest[];
};

export type OrderStatusRequest = {
  status: OrderStatus;
};

export type Order = {
  id: string;
  clientProfileId: string | null;
  storeId: string | null;
  status: OrderStatus;
  total: number;
  createdAt: string | null;
};
