// src/model/universal/sub-atoms/query-building/query-build-order-by.ts
// Builds ORDER BY clause for sorting query results

/**
 * Generates an ORDER BY clause using a quoted column name and direction.
 * Defaults to created_at DESC — most recent records first.
 */
export function queryBuildOrderBy(
  field: string = "created_at",
  direction: "ASC" | "DESC" = "DESC",
): string {
  return `ORDER BY "${field}" ${direction}`;
}
