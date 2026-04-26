// src/config/universal/atoms/stat-category-field-atom.ts
// Semantic grouping of a stat: attribute, resource, offensive, defensive, or utility.

import { DISPLAY_FORMATS, FIELD_MARKERS, STAT_CATEGORIES } from "../sub-atoms";

export const STAT_CATEGORY_FIELD_ATOM = {
  name: "category",
  type: "enum",
  label: "Category",
  values: [
    STAT_CATEGORIES.attribute,
    STAT_CATEGORIES.resource,
    STAT_CATEGORIES.offensive,
    STAT_CATEGORIES.defensive,
    STAT_CATEGORIES.utility,
  ] as const,
  ...FIELD_MARKERS.required,
  ...DISPLAY_FORMATS.select,
} as const;
