// src/controller/sub-atoms/response/format-paginated.ts
// Wraps an array result with count metadata

export type PaginatedResponse<T> = {
  readonly success: true;
  readonly data: T[];
  readonly count: number;
};

/**
 * Wraps an array in the standard paginated envelope.
 * count lets clients know how many records were returned without measuring the array.
 */
export function formatPaginated<T>(data: T[]): PaginatedResponse<T> {
  return { success: true, data, count: data.length };
}
