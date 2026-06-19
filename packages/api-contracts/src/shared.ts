export type ApiSuccess<T> = {
  data: T;
};

export type ApiError = {
  error: string;
  details?: unknown;
};

export type EntityStatus = "active" | "inactive";

export type IdParams = {
  id: string;
};
