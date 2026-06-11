import type { LoginCredentials, LoginValidationErrors } from "../../domain/auth/credentials";
import { validateLoginCredentials } from "../../domain/auth/validation";

type LoginSuccess = {
  ok: true;
  userName: string;
  nextRoute: string;
};

type LoginFailure = {
  ok: false;
  errors: LoginValidationErrors;
  message?: string;
};

export type LoginResult = LoginSuccess | LoginFailure;

function hasValidationErrors(errors: LoginValidationErrors): boolean {
  return Boolean(errors.email || errors.password);
}

// Demo auth flow until backend auth endpoint is integrated.
export async function loginUseCase(credentials: LoginCredentials): Promise<LoginResult> {
  const errors = validateLoginCredentials(credentials);

  if (hasValidationErrors(errors)) {
    return { ok: false, errors };
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (
    credentials.email.trim().toLowerCase() === "admin@savanhi.com" &&
    credentials.password === "Admin123!"
  ) {
    return {
      ok: true,
      userName: "Administrador",
      nextRoute: "/dashboard",
    };
  }

  return {
    ok: false,
    errors: { password: "Credenciales invalidas." },
    message: "No fue posible iniciar sesion.",
  };
}
