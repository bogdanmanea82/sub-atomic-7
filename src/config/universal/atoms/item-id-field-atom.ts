// src/config/universal/atoms/item-id-field-atom.ts
// FK reference to Item — used by junction entities (ItemStatBase).

import { DISPLAY_FORMATS, FIELD_MARKERS } from "../sub-atoms";

export const ITEM_ID_FIELD_ATOM = {
  name: "item_id",
  type: "reference",
  label: "Item",
  targetEntity: "Item",
  targetTable: "item",
  targetDisplayField: "name",
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.hidden,
} as const;
