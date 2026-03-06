// src/model-service/atoms/crud/select-many.ts
// Fetches multiple records from the database using a prepared query

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { executeSelect } from "../../sub-atoms/database";

/**
 * Fetches multiple database rows using a prepared SELECT query.
 * Returns an empty array if no records match.
 * Query is built by Layer 1 — this atom only executes it.
 */
export async function selectMany(
  db: SQL,
  query: PreparedQuery,
): Promise<Record<string, unknown>[]> {
  try {
    return await executeSelect(db, query);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Select many failed: ${message}`);
  }
}
