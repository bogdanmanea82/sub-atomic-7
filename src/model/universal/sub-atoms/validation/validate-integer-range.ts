// src/model/universal/sub-atoms/validation/validate-integer-range.ts
// Validates that an integer value falls within min/max range bounds

export function validateIntegerRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (value < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }

  if (value > max) {
    throw new Error(`${fieldName} must be no more than ${max}`);
  }

  return value;
}
