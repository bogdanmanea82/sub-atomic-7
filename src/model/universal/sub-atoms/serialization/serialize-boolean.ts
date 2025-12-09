// src/model/universal/sub-atoms/serialization/serialize-boolean.ts
// Converts boolean to database integer format (1 or 0), preserving null

export function serializeBoolean(value: boolean | null): number | null {
  if (value === null) return null;
  return value ? 1 : 0;
}
