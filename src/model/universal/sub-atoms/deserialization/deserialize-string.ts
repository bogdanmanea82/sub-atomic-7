// src/model/universal/sub-atoms/deserialization/deserialize-string.ts
// Passes database string through, preserving null

export function deserializeString(value: string | null): string | null {
  if (value === null) return null;
  return value;
}
