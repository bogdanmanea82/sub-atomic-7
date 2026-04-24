// src/config/universal/atoms/stat-value-min-field-atom.ts
// Minimum valid value for a stat (stored as integer regardless of data type).

import { DISPLAY_FORMATS, FIELD_MARKERS, INTEGER_CONSTRAINTS } from "../sub-atoms";

// Signed range allows negative minimums (e.g. fire_resistance value_min = -100).
export const STAT_VALUE_MIN_FIELD_ATOM = {
  name: "value_min",
  type: "integer",
  label: "Minimum Value",
  ...INTEGER_CONSTRAINTS.signed,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.number,
} as const;
