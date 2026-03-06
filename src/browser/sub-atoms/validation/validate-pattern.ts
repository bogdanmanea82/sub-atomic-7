// src/browser/sub-atoms/validation/validate-pattern.ts
// Validates a string against a regex pattern from field config.
// Layer 1 doesn't have this as a separate sub-atom — StringFieldConfig.pattern
// is an optional constraint that the browser can check before the server round-trip.

/**
 * Checks that a string value matches a regex pattern.
 * Returns null when valid (or when no pattern is provided), an error message when invalid.
 */
export function validatePattern(
  value: string,
  pattern: string | undefined,
  fieldLabel: string
): string | null {
  if (pattern === undefined) {
    return null;
  }

  const regex = new RegExp(pattern);
  if (!regex.test(value)) {
    return `${fieldLabel} format is invalid`;
  }

  return null;
}
