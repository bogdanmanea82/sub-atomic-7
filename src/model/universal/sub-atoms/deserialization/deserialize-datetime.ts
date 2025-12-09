// src/model/universal/sub-atoms/deserialization/deserialize-datetime.ts
// Converts database ISO string to Date object, preserving null

export function deserializeDatetime(value: Date | null): Date | null {
  if (value === null) return null;
  return new Date(value);
}
