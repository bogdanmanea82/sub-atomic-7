// src/config/universal/sub-atoms/stat-categories.ts
// Semantic groupings that stats belong to.
// Used as the `category` field on Stat rows and as a display/filter aid in UI.

export const STAT_CATEGORY_ATTRIBUTE = "attribute" as const;
export const STAT_CATEGORY_RESOURCE  = "resource"  as const;
export const STAT_CATEGORY_OFFENSIVE = "offensive" as const;
export const STAT_CATEGORY_DEFENSIVE = "defensive" as const;
export const STAT_CATEGORY_UTILITY   = "utility"   as const;

export const STAT_CATEGORIES = {
  attribute: STAT_CATEGORY_ATTRIBUTE,
  resource:  STAT_CATEGORY_RESOURCE,
  offensive: STAT_CATEGORY_OFFENSIVE,
  defensive: STAT_CATEGORY_DEFENSIVE,
  utility:   STAT_CATEGORY_UTILITY,
} as const;

export type StatCategory = typeof STAT_CATEGORIES[keyof typeof STAT_CATEGORIES];
