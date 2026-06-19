import type { LoginCredentials, LoginValidationErrors } from "../../domain/auth/credentials";
import { validateLoginCredentials } from "../../domain/auth/validation";
import { login as loginRequest, saveSession } from "./auth-api";

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

function routeByRole(role: string): string {
  if (role === "admin" || role === "marca") return "/dashboard";
  return "/dashboard";
}

export async function loginUseCase(credentials: LoginCredentials): Promise<LoginResult> {
  const errors = validateLoginCredentials(credentials);

  if (hasValidationErrors(errors)) {
    return { ok: false, errors };
  }

  try {
    const response = await loginRequest(credentials.email, credentials.password);
    saveSession(response);

    return {
      ok: true,
      userName: response.user.fullName,
      nextRoute: routeByRole(response.user.role),
    };
  } catch (error) {
    return {
      ok: false,
      errors: { password: "Credenciales invalidas." },
      message: error instanceof Error ? error.message : "No fue posible iniciar sesion.",
    };
  }
}
