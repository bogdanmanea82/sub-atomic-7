// src/view-service/sub-atoms/formatters/format-boolean.ts
// Formats boolean values into human-readable strings

/**
 * Formats a boolean as a colored status dot with tooltip — used for status fields like isActive.
 * Returns HTML (not plain text) — callers must not escape the output.
 */
export function formatBoolean(value: boolean): string {
  const cls = value ? "status-dot--active" : "status-dot--inactive";
  return `<span class="status-dot ${cls}"></span>`;
}

/**
 * Formats a boolean as "Yes" / "No" — used for simple yes/no fields.
 */
export function formatBooleanYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}
