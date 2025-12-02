// src/config/universal/sub-atoms/string-constraints.ts
// Reusable string constraint configurations

/**
 * Standard string constraints for typical text fields.
 * Use for names, titles, and short text.
 */

export const STRING_CONSTRAINTS_STANDARD = {
  minLength: 3,
  maxLength: 255,
} as const;

/**
 * Short string constraints for codes and abbreviations.
 */
export const STRING_CONSTRAINTS_SHORT = {
  minLength: 3,
  maxLength: 50,
} as const;

/**
 * Long string constraints for descriptions and text blocks.
 */
export const STRING_CONSTRAINTS_LONG = {
  minLength: 3,
  maxLength: 5000,
} as const;

/**
 * Grouped export for convenient importing.
 */
export const STRING_CONSTRAINTS = {
  standard: STRING_CONSTRAINTS_STANDARD,
  short: STRING_CONSTRAINTS_SHORT,
  long: STRING_CONSTRAINTS_LONG,
} as const;
