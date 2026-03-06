// src/model-service/atoms/crud/select-by-id.ts
// Fetches a single record from the database using a prepared query

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { executeSelect } from "../../sub-atoms/database";

/**
 * Fetches a single database row using a prepared SELECT query.
 * Returns the first matching row, or null if no records match.
 * Query is built by Layer 1 — this atom only executes it.
 */
export async function selectById(
  db: SQL,
  query: PreparedQuery,
): Promise<Record<string, unknown> | null> {
  try {
    const rows = await executeSelect(db, query);
    return rows[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Select by ID failed: ${message}`);
  }
}
