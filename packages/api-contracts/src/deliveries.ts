export const DELIVERY_STATUSES = ["assigned", "picked_up", "on_route", "delivered", "failed"] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export type DeliveryStatusRequest = {
  status: DeliveryStatus;
};

export type DeliveryLocationRequest = {
  latitude: number;
  longitude: number;
};

export type Delivery = {
  id: string;
  orderId: string | null;
  deliveryProfileId: string | null;
  status: DeliveryStatus;
  createdAt: string | null;
};
