// src/controller/sub-atoms/response/format-success.ts
// Wraps a successful result in a consistent JSON envelope

export type SuccessResponse<T> = {
  readonly success: true;
  readonly data: T;
};

/**
 * Wraps any data in the standard success envelope.
 * The generic <T> preserves the exact type of data for TypeScript callers.
 */
export function formatSuccess<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}
