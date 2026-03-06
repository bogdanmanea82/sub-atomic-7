// src/view-service/sub-atoms/formatters/format-number.ts
// Formats numeric values for display

/**
 * Formats an integer with locale-appropriate thousands separators.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}
