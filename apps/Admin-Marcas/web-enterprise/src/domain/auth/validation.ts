import type { LoginCredentials, LoginValidationErrors } from "./credentials";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginCredentials(
  credentials: LoginCredentials,
): LoginValidationErrors {
  const errors: LoginValidationErrors = {};

  if (!credentials.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_PATTERN.test(credentials.email.trim())) {
    errors.email = "Ingresa un correo valido.";
  }

  if (!credentials.password) {
    errors.password = "La contrasena es obligatoria.";
  } else if (credentials.password.length < 8) {
    errors.password = "La contrasena debe tener al menos 8 caracteres.";
  }

  return errors;
}
