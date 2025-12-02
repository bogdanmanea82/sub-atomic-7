// src/config/universal/atoms/name-field-atom.ts
// Name field atom - primary display field for entities

import {
  DISPLAY_FORMATS,
  FIELD_MARKERS,
  STRING_CONSTRAINTS,
} from "../sub-atoms";

/**
 * Name field configuration.
 * Required string, primary display field, shown in lists.
 */
export const NAME_FIELD_ATOM = {
  name: "name",
  type: "string",
  label: "Name",
  ...STRING_CONSTRAINTS.standard,
  ...FIELD_MARKERS.primary,
  ...DISPLAY_FORMATS.text,
} as const;
