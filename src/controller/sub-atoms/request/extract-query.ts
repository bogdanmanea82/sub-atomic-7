// src/controller/sub-atoms/request/extract-query.ts
// Converts ElysiaJS query string parameters into Layer 2 conditions format

/**
 * Returns query params as conditions for Layer 2 workflows, or undefined if none.
 * An empty query string means "no filter" — selectMany returns all records.
 */
export function extractQueryConditions(
  query: Record<string, string>,
): Record<string, unknown> | undefined {
  if (Object.keys(query).length === 0) {
    return undefined;
  }
  return query as Record<string, unknown>;
}
