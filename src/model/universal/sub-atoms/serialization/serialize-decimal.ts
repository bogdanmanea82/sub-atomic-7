// Converts number to string for PostgreSQL NUMERIC column storage.
// Avoids floating-point precision issues by sending as string.

export function serializeDecimal(value: number | null): string | null {
  if (value === null) return null;
  return String(value);
}
