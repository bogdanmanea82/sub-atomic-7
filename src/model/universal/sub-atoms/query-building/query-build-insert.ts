// src/model/universal/sub-atoms/query-building/query-build-insert.ts
// Builds INSERT statement with parameterized placeholders

import type { PreparedQuery } from "../types/prepared-query";

export function queryBuildInsert(
  tableName: string,
  data: Record<string, unknown>
): PreparedQuery {
  const fields = Object.keys(data);
  const placeholders = fields.map(() => "?").join(", ");
  const values = fields.map((field) => data[field]);

  return {
    sql: `INSERT INTO ${tableName} (${fields.join(
      ", "
    )}) VALUES (${placeholders})`,
    params: values,
  };
}
