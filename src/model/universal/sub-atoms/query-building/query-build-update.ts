// src/model/universal/sub-atoms/query-building/query-build-update.ts
// Builds UPDATE SET clause with parameterized placeholders

import type { PreparedQuery } from "../types/prepared-query";

export function queryBuildUpdate(
  tableName: string,
  data: Record<string, unknown>
): PreparedQuery {
  const fields = Object.keys(data);
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  return {
    sql: `UPDATE ${tableName} SET ${setClause}`,
    params: values,
  };
}
