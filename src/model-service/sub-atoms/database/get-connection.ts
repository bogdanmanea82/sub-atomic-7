// src/model-service/sub-atoms/database/get-connection.ts
// Creates and manages the PostgreSQL client for the application

import { SQL } from "bun";

// Singleton client — created once, reused on every call
// Bun's SQL manages the connection pool internally
let client: SQL | null = null;

/**
 * Returns the shared PostgreSQL client.
 * Creates it on first call using DATABASE_URL environment variable.
 * Throws immediately if DATABASE_URL is not set — fail fast at startup.
 */
export function getConnection(): SQL {
  if (client === null) {
    const url = process.env["DATABASE_URL"];
    if (!url) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    client = new SQL(url);
  }
  return client;
}
