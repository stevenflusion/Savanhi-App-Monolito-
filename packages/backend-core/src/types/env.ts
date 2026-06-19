export type BackendEnv = {
  serviceName: string;
  nodeEnv: string;
  port: number;
  allowedOrigins: string[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  authJwtSecret: string;
};
