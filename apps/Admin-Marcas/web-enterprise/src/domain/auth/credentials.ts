export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginValidationErrors = Partial<Record<keyof LoginCredentials, string>>;
