// src/config/universal/atoms/description-field-atom.ts
// Description field atom - optional text content for entities

import {
  DISPLAY_FORMATS,
  FIELD_MARKERS,
  STRING_CONSTRAINTS,
} from "../sub-atoms";

/**
 * Description field configuration.
 * Optional long text, rendered as textarea.
 */
export const DESCRIPTION_FIELD_ATOM = {
  name: "description",
  type: "string",
  label: "Description",
  ...STRING_CONSTRAINTS.long,
  ...FIELD_MARKERS.optional,
  ...DISPLAY_FORMATS.textarea,
} as const;
