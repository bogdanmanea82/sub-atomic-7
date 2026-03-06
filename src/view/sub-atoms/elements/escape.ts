// src/view/sub-atoms/elements/escape.ts
// XSS prevention — always escape user-provided content before HTML interpolation

/**
 * Escapes special HTML characters to their entity equivalents.
 * Use on every string that originates from user input or the database.
 * Pre-formatted values from Layer 4 (dates, numbers) are safe — strings are not.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
