// src/model/universal/sub-atoms/types/pagination-params.ts
// Pagination parameters for paginated SELECT queries

export type PaginationParams = {
  readonly page: number;
  readonly pageSize: number;
};

/** Default records per page — fits well at 1080p without scrolling. */
export const DEFAULT_PAGE_SIZE = 15;
