// src/view-service/sub-atoms/formatters/format-boolean.ts
// Formats boolean values into human-readable strings

/**
 * Formats a boolean as "Active" / "Inactive" — used for status fields like isActive.
 */
export function formatBoolean(value: boolean): string {
  return value ? "Active" : "Inactive";
}

/**
 * Formats a boolean as "Yes" / "No" — used for simple yes/no fields.
 */
export function formatBooleanYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}
