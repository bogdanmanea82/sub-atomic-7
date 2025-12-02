// src/config/universal/atoms/created-at-field-atom.ts
// CreatedAt field atom - timestamp for record creation

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms/";

/**
 * CreatedAt field configuration.
 * Auto-set on creation, system-managed, shown in lists.
 */
export const CREATED_AT_FIELD_ATOM = {
  name: "createdAt",
  type: "timestamp",
  label: "Created",
  ...FIELD_MARKERS.system,
  ...DISPLAY_FORMATS.datetime,
  autoSet: "create",
  showInList: true,
} as const;
