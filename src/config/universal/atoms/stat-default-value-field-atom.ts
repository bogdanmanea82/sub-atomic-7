// src/config/universal/atoms/stat-default-value-field-atom.ts
// Starting value for a stat before any modifiers are applied.

import { DISPLAY_FORMATS, FIELD_MARKERS, INTEGER_CONSTRAINTS } from "../sub-atoms";

export const STAT_DEFAULT_VALUE_FIELD_ATOM = {
  name: "default_value",
  type: "integer",
  label: "Default Value",
  ...INTEGER_CONSTRAINTS.standard,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.number,
} as const;
