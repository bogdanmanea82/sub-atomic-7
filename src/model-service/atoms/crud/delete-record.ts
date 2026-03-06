// src/model-service/atoms/crud/delete-record.ts
// Executes a DELETE operation against the database

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { executeSelect } from "../../sub-atoms/database";

/**
 * Executes a DELETE query and returns whether a record was deleted.
 * Returns true if a row was deleted, false if no matching record was found.
 */
export async function deleteRecord(
  db: SQL,
  query: PreparedQuery,
): Promise<boolean> {
  try {
    const rows = await executeSelect(db, query);
    return rows.length > 0;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Delete failed: ${message}`);
  }
}
