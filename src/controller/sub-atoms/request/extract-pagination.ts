// src/controller/sub-atoms/request/extract-pagination.ts
// Parses pagination parameters from query string with safe defaults

import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { DEFAULT_PAGE_SIZE } from "@model/universal/sub-atoms/types/pagination-params";

/**
 * Extracts page and pageSize from query params with validation.
 * Invalid or missing values fall back to page 1, default page size.
 * pageSize is clamped to 1–100 to prevent abuse.
 */
export function extractPagination(
  query: Record<string, string>,
): PaginationParams {
  const rawPage = Number(query["page"]);
  const rawSize = Number(query["pageSize"]);

  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const pageSize = Number.isInteger(rawSize) && rawSize >= 1
    ? Math.min(rawSize, 100)
    : DEFAULT_PAGE_SIZE;

  return { page, pageSize };
}
