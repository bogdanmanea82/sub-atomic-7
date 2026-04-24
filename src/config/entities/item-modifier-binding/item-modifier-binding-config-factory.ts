// src/config/entities/item-modifier-binding/item-modifier-binding-config-factory.ts
// ItemModifier-specific binding configuration.
// Delegates all structure to the generic ModifierBindingConfigFactory.

import { ModifierBindingConfigFactory } from "../../factories/modifier-binding-config-factory";

export { ModifierBindingConfigFactory };
export const ITEM_MODIFIER_BINDING_CONFIG = new ModifierBindingConfigFactory("ItemModifier", "item_modifier").create();
