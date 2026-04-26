// src/config/universal/atoms/affix-type-field-atom.ts
// Whether this modifier is a prefix or suffix on the item name.

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

export const AFFIX_TYPE_FIELD_ATOM = {
  name: "affix_type",
  type: "enum",
  label: "Affix Type",
  values: ["prefix", "suffix"] as const,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
  listOrder: 20,
} as const;
