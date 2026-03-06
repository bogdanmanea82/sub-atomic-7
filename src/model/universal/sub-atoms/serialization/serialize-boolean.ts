// src/model/universal/sub-atoms/serialization/serialize-boolean.ts
// Converts boolean to database-ready format, preserving null.
// PostgreSQL accepts native booleans — no integer conversion needed.

export function serializeBoolean(value: boolean | null): boolean | null {
  if (value === null) return null;
  return value;
}
