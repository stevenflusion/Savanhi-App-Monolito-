export function getHealthStatus() {
  return {
    service: "admin-marcas-backend",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}

export function getPingStatus() {
  return { message: "pong" };
}
