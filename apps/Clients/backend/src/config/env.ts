import { createEnv } from "@repo/backend-core";

export const env = createEnv({
  serviceName: "clients-backend",
  defaultPort: 4100,
});
