import dotenv from "dotenv";

dotenv.config();

function parsePort(rawPort) {
  const parsedPort = Number(rawPort);
  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("Invalid PORT value. It must be a positive integer.");
  }
  return parsedPort;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT ?? "4000"),
};
