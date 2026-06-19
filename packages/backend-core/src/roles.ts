import { AUTH_ROLES, type AuthRole } from "@repo/api-contracts/auth";

export { AUTH_ROLES };

export function isAuthRole(role: unknown): role is AuthRole {
  return typeof role === "string" && AUTH_ROLES.includes(role as AuthRole);
}

export function normalizeRole(role: unknown, fallbackRole: AuthRole = "tendero"): AuthRole {
  return isAuthRole(role) ? role : fallbackRole;
}
