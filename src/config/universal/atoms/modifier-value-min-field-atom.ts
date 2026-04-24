// src/config/universal/atoms/modifier-value-min-field-atom.ts
// Lower bound of the rolled value range. Signed — some modifiers reduce stats.

import { DISPLAY_FORMATS, FIELD_MARKERS, INTEGER_CONSTRAINTS } from "../sub-atoms";

export const MODIFIER_VALUE_MIN_FIELD_ATOM = {
  name: "value_min",
  type: "integer",
  label: "Value Min",
  ...INTEGER_CONSTRAINTS.signed,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.number,
} as const;
