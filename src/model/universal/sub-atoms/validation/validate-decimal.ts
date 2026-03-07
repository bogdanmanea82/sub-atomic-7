// Validates that a value is a finite number, with optional min/max range check

export function validateDecimal(
  value: number,
  fieldName: string,
  min?: number,
  max?: number,
): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (min !== undefined && value < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }

  return value;
}
