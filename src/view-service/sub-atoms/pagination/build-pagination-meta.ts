// src/view-service/sub-atoms/pagination/build-pagination-meta.ts
// Computes display-ready pagination metadata from raw counts

import type { PaginationMeta } from "../../types";

/**
 * Transforms totalCount + current page/pageSize into a PaginationMeta object.
 * View layer uses this to render page controls without any math.
 */
export function buildPaginationMeta(
  totalCount: number,
  currentPage: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}
