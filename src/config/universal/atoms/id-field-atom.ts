// src/config/universal/atoms/id-field-atom.ts
// ID field atom - UUID primary key for all entities

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

/**
 * ID field configuration.
 * Auto-generated UUID, system-managed, hidden from forms.
 */
export const ID_FIELD_ATOM = {
  name: "id",
  type: "uuid",
  label: "ID",
  ...FIELD_MARKERS.system,
  ...DISPLAY_FORMATS.hidden,
  autoGenerate: true,
} as const;
