// src/config/universal/atoms/stat-value-max-field-atom.ts
// Maximum valid value for a stat (stored as integer regardless of data type).

import { DISPLAY_FORMATS, FIELD_MARKERS, INTEGER_CONSTRAINTS } from "../sub-atoms";

// Signed range mirrors value_min — both bounds can be negative for debuff stats.
export const STAT_VALUE_MAX_FIELD_ATOM = {
  name: "value_max",
  type: "integer",
  label: "Maximum Value",
  ...INTEGER_CONSTRAINTS.signed,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.number,
} as const;
