// src/view/entities/modifier/modifier-tabs.ts
// Tab definitions for the modifier detail and edit pages.
// Screens 2-4 are placeholders until those features are implemented.

import type { TabDefinition } from "../../molecules/sections/tab-bar";

export const MODIFIER_TABS: readonly TabDefinition[] = [
  { id: "definition", label: "Definition & Tiers", active: true },
  { id: "bindings", label: "Bindings", active: false },
  { id: "assignments", label: "Assignments", active: false },
];
