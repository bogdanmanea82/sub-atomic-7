// src/model/universal/sub-atoms/deserialization/deserialize-boolean.ts
// Converts database boolean to TypeScript boolean, preserving null.
// Handles both native booleans (PostgreSQL) and integers (SQLite).

export function deserializeBoolean(value: boolean | number | null): boolean | null {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  return value === 1;
}
