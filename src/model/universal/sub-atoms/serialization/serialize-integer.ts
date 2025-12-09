// src/model/universal/sub-atoms/serialization/serialize-integer.ts
// Passes integer through for database storage, preserving null

export function serializeInteger(value: number | null): number | null {
  if (value === null) return null;
  return value;
}
