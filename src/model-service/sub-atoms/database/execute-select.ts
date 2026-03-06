// src/model-service/sub-atoms/database/execute-select.ts
// Executes a query and returns all matching rows.
// Use for SELECT queries and writes with RETURNING clauses.

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { convertPlaceholders } from "./convert-placeholders";

export async function executeSelect(
  db: SQL,
  query: PreparedQuery,
): Promise<Record<string, unknown>[]> {
  const pgSql = convertPlaceholders(query.sql);
  const rows = await db.unsafe(pgSql, query.params);
  return rows as Record<string, unknown>[];
}
