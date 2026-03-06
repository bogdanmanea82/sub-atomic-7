// src/view-service/sub-atoms/formatters/format-date.ts
// Formats Date values into locale-friendly display strings

/**
 * Formats a Date into a short human-readable string.
 * Uses ISO format as fallback if the value is not a valid Date.
 */
export function formatDate(value: Date): string {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    return String(value);
  }
  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a Date into a full datetime string including time.
 */
export function formatDatetime(value: Date): string {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    return String(value);
  }
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
