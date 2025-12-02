// src/config/universal/sub-atoms/integer-constraints.ts
// Reusable integer constraint configurations

/**
 * Standard integer constraints for general numeric fields.
 */
export const INTEGER_CONSTRAINTS_STANDARD = {
  min: 0,
  max: 2147483647,
} as const;

/**
 * Positive integer constraints (1 and above).
 */
export const INTEGER_CONSTRAINTS_POSITIVE = {
  min: 1,
  max: 2147483647,
} as const;

/**
 * Percentage constraints (0-100).
 */
export const INTEGER_CONSTRAINTS_PERCENTAGE = {
  min: 0,
  max: 100,
} as const;

/**
 * Grouped export for convenient importing.
 */
export const INTEGER_CONSTRAINTS = {
  standard: INTEGER_CONSTRAINTS_STANDARD,
  positive: INTEGER_CONSTRAINTS_POSITIVE,
  percentage: INTEGER_CONSTRAINTS_PERCENTAGE,
} as const;
