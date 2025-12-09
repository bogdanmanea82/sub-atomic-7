// src/model/universal/sub-atoms/validation/validate-boolean.ts
// Validates and normalizes a value to boolean type

export function validateBoolean(
  value: string | number | boolean,
  fieldName: string
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
  }

  throw new Error(`${fieldName} must be a valid boolean value`);
}
