// src/browser/sub-atoms/validation/validate-required.ts
// Client-side mirror of Layer 1 validate-required.
// Returns an error message instead of throwing — browser collects all errors for inline display.

/**
 * Checks that a form value is not empty.
 * Form inputs always produce strings, so empty string counts as missing.
 * Returns null when valid, an error message when invalid.
 */
export function validateRequired(
  value: string,
  fieldLabel: string
): string | null {
  if (value.trim() === "") {
    return `${fieldLabel} is required`;
  }
  return null;
}
