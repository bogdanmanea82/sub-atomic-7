// src/browser/sub-atoms/validation/validate-integer-range.ts
// Client-side mirror of Layer 1 validate-integer-range.
// Parses the string input to a number before checking the range.

/**
 * Checks that a numeric string value represents an integer within min/max bounds.
 * Returns null when valid, an error message when invalid.
 */
export function validateIntegerRange(
  value: string,
  min: number,
  max: number,
  fieldLabel: string
): string | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return `${fieldLabel} must be a whole number`;
  }

  if (parsed < min) {
    return `${fieldLabel} must be at least ${min}`;
  }

  if (parsed > max) {
    return `${fieldLabel} must be no more than ${max}`;
  }

  return null;
}
