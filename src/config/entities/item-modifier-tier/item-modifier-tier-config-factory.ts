// src/config/entities/item-modifier-tier/item-modifier-tier-config-factory.ts
// ItemModifier-specific tier configuration.
// Delegates all structure to the generic ModifierTierConfigFactory.

import { ModifierTierConfigFactory } from "../../factories/modifier-tier-config-factory";

export { ModifierTierConfigFactory };
export const ITEM_MODIFIER_TIER_CONFIG = new ModifierTierConfigFactory("ItemModifier", "item_modifier").create();
