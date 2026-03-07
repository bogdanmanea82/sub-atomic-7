// src/model/entities/modifier-tier/modifier-tier-model.ts
// ModifierTier model organism — Layer 1 public interface for tier validation/serialization/queries

import { MODIFIER_TIER_CONFIG } from "@config/entities/modifier-tier";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import { buildSelectQuery } from "../../universal/atoms/build-select-query";
import { buildDeleteQuery } from "../../universal/atoms/build-delete-query";

export type ModifierTier = {
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

export const ModifierTierModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(MODIFIER_TIER_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(MODIFIER_TIER_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): ModifierTier {
    return deserializeEntity(MODIFIER_TIER_CONFIG, row) as ModifierTier;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(MODIFIER_TIER_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(MODIFIER_TIER_CONFIG, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(MODIFIER_TIER_CONFIG, conditions);
  },
};
