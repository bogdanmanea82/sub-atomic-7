// src/view-service/sub-atoms/formatters/format-status.ts
// Generates CSS class names for status badges

/**
 * Returns a CSS class name for an active/inactive status.
 * Layer 5 applies this class to a badge element.
 */
export function formatStatusClass(isActive: boolean): string {
  return isActive ? "badge badge--active" : "badge badge--inactive";
}
