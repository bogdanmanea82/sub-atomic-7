// src/config/entities/enemy-modifier-binding/enemy-modifier-binding-config-factory.ts
// Enemy-specific binding configuration.
// Binds a universal Modifier to enemy categories/subcategories in the Enemies hierarchy.
//
// No enemy-specific fields at this time — starts lean.
// Enemy-specific binding concerns (e.g. is_boss_only, spawn_condition) can be added
// as additionalFields when the rolling system specifically calls for them.

import { ModifierBindingConfigFactory } from "../../factories/modifier-binding-config-factory";

export const ENEMY_MODIFIER_BINDING_CONFIG = new ModifierBindingConfigFactory(
  "Modifier",             // parent FK entity → Modifier (universal)
  "modifier",             // parent FK table   → modifier
  [],                     // no enemy-specific fields at this time
  "EnemyModifierBinding", // binding entity name → table: enemy_modifier_binding
).create();
