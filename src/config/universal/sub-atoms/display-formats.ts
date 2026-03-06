// src/config/universal/sub-atoms/display-formats.ts
// Reusable display format configurations

/**
 * Text input display format.
 */
export const DISPLAY_FORMAT_TEXT = {
  displayFormat: "text",
} as const;

/**
 * Textarea display format for longer content.
 */
export const DISPLAY_FORMAT_TEXTAREA = {
  displayFormat: "textarea",
} as const;

/**
 * Number input display format.
 */
export const DISPLAY_FORMAT_NUMBER = {
  displayFormat: "number",
} as const;

/**
 * Toggle/checkbox display format.
 */
export const DISPLAY_FORMAT_TOGGLE = {
  displayFormat: "toggle",
} as const;

/**
 * Datetime picker display format.
 */
export const DISPLAY_FORMAT_DATETIME = {
  displayFormat: "datetime",
} as const;

/**
 * Select dropdown display format for reference/foreign key fields.
 */
export const DISPLAY_FORMAT_SELECT = {
  displayFormat: "select",
} as const;

/**
 * Hidden field (not rendered in forms).
 */
export const DISPLAY_FORMAT_HIDDEN = {
  displayFormat: "hidden",
} as const;

/**
 * Grouped export for convenient importing.
 */
export const DISPLAY_FORMATS = {
  text: DISPLAY_FORMAT_TEXT,
  textarea: DISPLAY_FORMAT_TEXTAREA,
  number: DISPLAY_FORMAT_NUMBER,
  toggle: DISPLAY_FORMAT_TOGGLE,
  datetime: DISPLAY_FORMAT_DATETIME,
  select: DISPLAY_FORMAT_SELECT,
  hidden: DISPLAY_FORMAT_HIDDEN,
} as const;
