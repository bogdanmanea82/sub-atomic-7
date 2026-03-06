// src/model-service/sub-atoms/database/convert-placeholders.ts
// Converts ? placeholders to PostgreSQL $n format.
// Layer 1 query builders use ? for portability — this sub-atom adapts them.

export function convertPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}
