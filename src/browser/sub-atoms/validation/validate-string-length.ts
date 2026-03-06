// src/browser/sub-atoms/validation/validate-string-length.ts
// Client-side mirror of Layer 1 validate-string-length.
// Same constraints, same messages — ensures client and server agree.

/**
 * Checks that a string value falls within min/max length bounds.
 * Returns null when valid, an error message when invalid.
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldLabel: string
): string | null {
  if (value.length < minLength) {
    return `${fieldLabel} must be at least ${minLength} characters`;
  }

  if (value.length > maxLength) {
    return `${fieldLabel} must be no more than ${maxLength} characters`;
  }

  return null;
}
