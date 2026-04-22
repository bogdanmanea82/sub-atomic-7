// src/config/molecules/index.ts
// Top-level barrel for all config molecules.
// Each domain modifier type has its own subdirectory of reusable field molecules.
//
// Future domains follow the same pattern:
//   src/config/molecules/enemy/   → ENEMY_HIERARCHY_FIELDS, etc.
//   src/config/molecules/zone/    → ZONE_MODIFIER_FIELDS, etc.

export * from "./modifier";
