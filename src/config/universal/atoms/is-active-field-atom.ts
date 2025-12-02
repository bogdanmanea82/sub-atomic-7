// src/config/universal/atoms/is-active-field-atom.ts
// IsActive field atom - boolean status flag for entities

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

/**
 * IsActive field configuration.
 * Boolean toggle with default true, shown in lists.
 */
export const IS_ACTIVE_FIELD_ATOM = {
  name: "isActive",
  type: "boolean",
  label: "Active",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.toggle,
  defaultValue: true,
  showInList: true,
} as const;
