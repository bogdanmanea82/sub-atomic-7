// src/config/universal/sub-atoms/field-markers.ts
// Reusable field marker configurations

/**
 * Marker for required fields.
 */
export const FIELD_MARKER_REQUIRED = {
  required: true,
} as const;

/**
 * Marker for optional fields.
 */
export const FIELD_MARKER_OPTIONAL = {
  required: false,
} as const;

/**
 * Marker for system-managed fields (not user-editable).
 */
export const FIELD_MARKER_SYSTEM = {
  required: true,
  editable: false,
  showInList: false,
} as const;

/**
 * Marker for primary display fields (shown in lists and as record title).
 */
export const FIELD_MARKER_PRIMARY = {
  required: true,
  showInList: true,
  isPrimaryDisplay: true,
} as const;

/**
 * Grouped export for convenient importing.
 */
export const FIELD_MARKERS = {
  required: FIELD_MARKER_REQUIRED,
  optional: FIELD_MARKER_OPTIONAL,
  system: FIELD_MARKER_SYSTEM,
  primary: FIELD_MARKER_PRIMARY,
} as const;
