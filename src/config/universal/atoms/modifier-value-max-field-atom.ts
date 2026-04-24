// src/config/universal/atoms/modifier-value-max-field-atom.ts
// Upper bound of the rolled value range. Signed — mirrors modifier-value-min.

import { DISPLAY_FORMATS, FIELD_MARKERS, INTEGER_CONSTRAINTS } from "../sub-atoms";

export const MODIFIER_VALUE_MAX_FIELD_ATOM = {
  name: "value_max",
  type: "integer",
  label: "Value Max",
  ...INTEGER_CONSTRAINTS.signed,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.number,
} as const;
