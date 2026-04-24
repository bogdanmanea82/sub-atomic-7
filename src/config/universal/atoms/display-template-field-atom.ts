// src/config/universal/atoms/display-template-field-atom.ts
// Human-readable format string with placeholders for rolled values.
// Example: "Adds {min}–{max} Fire Damage" or "+{value}% increased Life"
// The view layer interpolates actual rolled values at display time.

import { DISPLAY_FORMATS, FIELD_MARKERS, STRING_CONSTRAINTS } from "../sub-atoms";

export const DISPLAY_TEMPLATE_FIELD_ATOM = {
  name: "display_template",
  type: "string",
  label: "Display Template",
  ...STRING_CONSTRAINTS.long,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.textarea,
} as const;
