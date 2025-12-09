// src/model/universal/sub-atoms/serialization/serialize-datetime.ts
// Converts Date to ISO string for database storage, preserving null

export function serializeDatetime(value: Date | null): string | null {
  if (value === null) return null;
  return value.toISOString();
}
