// src/model/entities/item-modifier-tier/item-modifier-tier-model.ts
// ItemModifierTier model organism — Layer 1 public interface for tier validation/serialization/queries

import { ITEM_MODIFIER_TIER_CONFIG } from "@config/entities/item-modifier-tier";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import { buildSelectQuery } from "../../universal/atoms/build-select-query";
import { buildDeleteQuery } from "../../universal/atoms/build-delete-query";

export type ItemModifierTier = {
  readonly id: string;
  readonly modifier_id: string;
  readonly tier_index: number;
  readonly min_value: number;
  readonly max_value: number;
  readonly level_req: number;
  readonly spawn_weight: number;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const ItemModifierTierModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(ITEM_MODIFIER_TIER_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(ITEM_MODIFIER_TIER_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): ItemModifierTier {
    return deserializeEntity(ITEM_MODIFIER_TIER_CONFIG, row) as ItemModifierTier;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(ITEM_MODIFIER_TIER_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(ITEM_MODIFIER_TIER_CONFIG, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(ITEM_MODIFIER_TIER_CONFIG, conditions);
  },
};
