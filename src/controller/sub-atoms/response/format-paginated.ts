// src/controller/sub-atoms/response/format-paginated.ts
// Wraps an array result with count and optional pagination metadata

export type PaginatedResponse<T> = {
  readonly success: true;
  readonly data: T[];
  readonly count: number;
  readonly totalCount?: number;
  readonly page?: number;
  readonly pageSize?: number;
  readonly totalPages?: number;
};

/**
 * Wraps an array in the standard paginated envelope.
 * When totalCount is provided, includes full pagination metadata.
 */
export function formatPaginated<T>(
  data: T[],
  totalCount?: number,
  page?: number,
  pageSize?: number,
): PaginatedResponse<T> {
  const base = { success: true as const, data, count: data.length };

  if (totalCount === undefined) return base;

  return {
    ...base,
    totalCount,
    page,
    pageSize,
    totalPages: pageSize ? Math.ceil(totalCount / pageSize) : undefined,
  };
}
