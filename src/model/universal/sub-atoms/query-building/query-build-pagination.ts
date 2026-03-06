// src/model/universal/sub-atoms/query-building/query-build-pagination.ts
// Builds LIMIT/OFFSET clause for paginated queries

import type { PreparedQuery } from "../types/prepared-query";

/**
 * Generates LIMIT ? OFFSET ? with computed offset from page number.
 * Page 1 = offset 0, page 2 = offset pageSize, etc.
 */
export function queryBuildPagination(
  page: number,
  pageSize: number,
): PreparedQuery {
  const offset = (page - 1) * pageSize;
  return {
    sql: "LIMIT ? OFFSET ?",
    params: [pageSize, offset],
  };
}
