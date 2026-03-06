// src/model/universal/sub-atoms/query-building/query-build-count.ts
// Builds SELECT COUNT(*) query for total record count

/**
 * Generates a COUNT query for the given table.
 * Used alongside paginated SELECT to compute total pages.
 */
export function queryBuildCount(tableName: string): string {
  return `SELECT COUNT(*)::integer AS total FROM ${tableName}`;
}
