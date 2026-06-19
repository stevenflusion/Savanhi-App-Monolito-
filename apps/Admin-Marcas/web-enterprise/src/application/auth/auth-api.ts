import type { AuthResponse, AuthSession, AuthUser } from "@repo/api-contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:4000";
const SESSION_STORAGE_KEY = "admin-marcas-session";

type LoginResponse = AuthResponse;

function parseJson(response: Response) {
  return response.json().catch(() => {
    throw new Error("La API devolvio una respuesta invalida.");
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data?.error ?? "No fue posible iniciar sesion.");
  }

  return data;
}

export async function me(accessToken: string): Promise<{ user: AuthUser }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(data?.error ?? "No fue posible recuperar la sesion.");
  }

  return data;
}

export function saveSession(session: LoginResponse) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): LoginResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
