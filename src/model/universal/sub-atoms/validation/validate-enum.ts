// src/model/universal/sub-atoms/validation/validate-enum.ts
// Validates that a value is one of the allowed enum values

export function validateEnum(
  value: string,
  allowedValues: readonly string[],
  fieldName: string
): string {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(", ")}`);
  }

  return value;
}
