// src/model/universal/sub-atoms/query-building/query-build-where.ts
// Builds WHERE clause with AND conditions

import type { PreparedQuery } from "../types/prepared-query";

export function queryBuildWhere(
  conditions: Record<string, unknown>
): PreparedQuery {
  const fields = Object.keys(conditions);

  if (fields.length === 0) {
    return { sql: "", params: [] };
  }

  const whereClause = fields.map((field) => `${field} = ?`).join(" AND ");
  const values = fields.map((field) => conditions[field]);

  return {
    sql: `WHERE ${whereClause}`,
    params: values,
  };
}
