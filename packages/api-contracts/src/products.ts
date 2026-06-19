export type Store = {
  id: string;
  ownerProfileId: string;
  name: string;
  address: string | null;
  active: boolean;
  createdAt: string | null;
};

export type StoreRequest = {
  name: string;
  address?: string | null;
};

export type Product = {
  id: string;
  storeId: string | null;
  brandId: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string | null;
};

export type ProductRequest = {
  storeId?: string | null;
  brandId?: string | null;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  active?: boolean;
};
