// src/model/universal/sub-atoms/deserialization/deserialize-boolean.ts
// Converts database integer (1 or 0) to boolean, preserving null

export function deserializeBoolean(value: number | null): boolean | null {
  if (value === null) return null;
  return value === 1;
}
