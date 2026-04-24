// src/config/universal/atoms/modifier-group-field-atom.ts
// Mutex tag — modifiers sharing the same group compete for a single slot on an asset.

import { DISPLAY_FORMATS, FIELD_MARKERS, STRING_CONSTRAINTS } from "../sub-atoms";

export const MODIFIER_GROUP_FIELD_ATOM = {
  name: "modifier_group",
  type: "string",
  label: "Modifier Group",
  ...STRING_CONSTRAINTS.short,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.text,
} as const;
