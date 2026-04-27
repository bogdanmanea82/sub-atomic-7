// src/config/entities/modifier-tier/modifier-tier-config-factory.ts
// Universal modifier tier configuration.
// Delegates all structure to the generic ModifierTierConfigFactory.

import { ModifierTierConfigFactory } from "../../factories/modifier-tier-config-factory";

export { ModifierTierConfigFactory };
export const MODIFIER_TIER_CONFIG = new ModifierTierConfigFactory("Modifier", "modifier").create();
