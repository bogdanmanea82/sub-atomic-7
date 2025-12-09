// src/model/universal/sub-atoms/query-building/query-build-values.ts
// Builds VALUES clause for batch inserts

import type { PreparedQuery } from "../types/prepared-query";

export function queryBuildValues(
  rows: Record<string, unknown>[]
): PreparedQuery {
  const firstRow = rows[0];

  if (firstRow === undefined) {
    return { sql: "", params: [] };
  }

  const fields = Object.keys(firstRow);
  const placeholderRow = `(${fields.map(() => "?").join(", ")})`;
  const allPlaceholders = rows.map(() => placeholderRow).join(", ");
  const allValues = rows.flatMap((row) => fields.map((field) => row[field]));

  return {
    sql: `VALUES ${allPlaceholders}`,
    params: allValues,
  };
}
