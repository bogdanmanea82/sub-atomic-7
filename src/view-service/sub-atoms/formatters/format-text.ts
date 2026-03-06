// src/view-service/sub-atoms/formatters/format-text.ts
// Formats string values for display

/**
 * Returns the string as-is, or an em-dash for empty/null values.
 * The em-dash (—) is the standard placeholder for missing display data.
 */
export function formatText(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === "") {
    return "—";
  }
  return value;
}

/**
 * Truncates long text to a maximum length with an ellipsis.
 */
export function formatTextTruncated(
  value: string | null | undefined,
  maxLength: number = 100
): string {
  const text = formatText(value);
  if (text === "—" || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
}
