// src/model-service/sub-atoms/database/execute-write.ts
// Executes a write query without returning rows.
// Use for INSERT, UPDATE, DELETE when you don't need the affected records.

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { convertPlaceholders } from "./convert-placeholders";

export async function executeWrite(
  db: SQL,
  query: PreparedQuery,
): Promise<void> {
  const pgSql = convertPlaceholders(query.sql);
  await db.unsafe(pgSql, query.params);
}
