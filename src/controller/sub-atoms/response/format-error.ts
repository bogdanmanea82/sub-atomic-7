// src/controller/sub-atoms/response/format-error.ts
// Wraps an error in a consistent JSON envelope

export type ErrorResponse = {
  readonly success: false;
  readonly error: string;
  readonly details?: Record<string, string>;
};

/**
 * Wraps an error message in the standard error envelope.
 * details is optional — used for validation errors (field → message map).
 */
export function formatError(
  error: string,
  details?: Record<string, string>,
): ErrorResponse {
  if (details) {
    return { success: false, error, details };
  }
  return { success: false, error };
}
