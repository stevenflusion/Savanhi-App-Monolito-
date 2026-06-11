import { getHealthStatus, getPingStatus } from "../services/health-service.js";

export function healthCheckController(_req, res) {
  res.status(200).json(getHealthStatus());
}

export function pingController(_req, res) {
  res.status(200).json(getPingStatus());
}
