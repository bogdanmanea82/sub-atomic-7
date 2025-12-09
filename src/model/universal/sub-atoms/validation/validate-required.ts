// src/model/universal/sub-atoms/validation/validate-required.ts
// Validates that a value is present (not null or undefined)

export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  return value;
}
