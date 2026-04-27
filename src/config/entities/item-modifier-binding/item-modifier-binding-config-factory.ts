// src/config/entities/item-modifier-binding/item-modifier-binding-config-factory.ts
// Item-specific binding configuration.
// affix_type (prefix|suffix) is item-specific — enemies and other asset types don't have
// affix slots, so it lives here rather than on the universal Modifier entity.

import { ModifierBindingConfigFactory } from "../../factories/modifier-binding-config-factory";
import { AFFIX_TYPE_FIELD_ATOM } from "../../universal/atoms";

export { ModifierBindingConfigFactory };
export const ITEM_MODIFIER_BINDING_CONFIG = new ModifierBindingConfigFactory(
  "ItemModifier",
  "item_modifier",
  [AFFIX_TYPE_FIELD_ATOM],
).create();
