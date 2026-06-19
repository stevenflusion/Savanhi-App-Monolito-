import { AUTH_ROLES } from "@repo/api-contracts/auth";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(AUTH_ROLES).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
