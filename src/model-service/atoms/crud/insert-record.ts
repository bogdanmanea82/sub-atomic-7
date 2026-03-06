// src/model-service/atoms/crud/insert-record.ts                                                                                                                                                                                             // Executes an INSERT operation against the database

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { executeWrite } from "../../sub-atoms/database";

/**
 * Executes an INSERT query against the database.
 * Wraps database errors with context before rethrowing.
 * Does not return the inserted record — call selectById after to fetch it.
 */
export async function insertRecord(
  db: SQL,
  query: PreparedQuery,
): Promise<void> {
  try {
    await executeWrite(db, query);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Insert failed: ${message}`);
  }
}
