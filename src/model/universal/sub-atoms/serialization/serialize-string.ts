// src/model/universal/sub-atoms/serialization/serialize-string.ts
// Converts string to database string format, preserving string

export function serializeString(value: string | null): string | null{
  if (value === null) return null;
  return value.trim();
}
