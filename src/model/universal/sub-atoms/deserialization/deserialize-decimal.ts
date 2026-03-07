// PostgreSQL returns NUMERIC columns as strings — parse to number.

export function deserializeDecimal(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}
