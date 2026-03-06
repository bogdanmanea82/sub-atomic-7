// src/model-service/sub-atoms/database/execute-query.ts
  // Executes a PreparedQuery from Layer 1 against the PostgreSQL connection

  import type { SQL } from "bun";
  import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";

  /**
   * Converts ? placeholders to $n format required by PostgreSQL.
   * Layer 1 query builders use ? for portability — this sub-atom adapts them.
   */
  function convertPlaceholders(sql: string): string {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  }

  /**
   * Executes a query and returns all matching rows.
   * Use for SELECT queries and writes with RETURNING clauses.
   */
  export async function executeSelect(
    db: SQL,
    query: PreparedQuery
  ): Promise<Record<string, unknown>[]> {
    const pgSql = convertPlaceholders(query.sql);
    const rows = await db.unsafe(pgSql, query.params);
    return rows as Record<string, unknown>[];
  }

  /**
   * Executes a write query without returning rows.
   * Use for INSERT, UPDATE, DELETE when you don't need the affected records.
   */
  export async function executeWrite(
    db: SQL,
    query: PreparedQuery
  ): Promise<void> {
    const pgSql = convertPlaceholders(query.sql);
    await db.unsafe(pgSql, query.params);
  }