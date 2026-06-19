import type { AuthUser } from "@repo/api-contracts/auth";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        token: string;
        user: AuthUser;
      };
    }
  }
}

export {};
