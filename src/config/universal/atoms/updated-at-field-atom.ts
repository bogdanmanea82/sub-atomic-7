// src/config/universal/atoms/updated-at-field-atom.ts
// UpdatedAt field atom - timestamp for record update.
import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

/**
 * UpdatedAt field configuration.
 * Modified on update, system-managed, shown in lists.
 */
export const UPDATED_AT_FIELD_ATOM = {
  name: "updatedAt",
  type: "timestamp",
  label: "Updated",
  ...FIELD_MARKERS.system,
  ...DISPLAY_FORMATS.datetime,
  autoSet: "update",
  showInList: true,
} as const;
