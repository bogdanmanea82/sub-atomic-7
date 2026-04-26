// src/model/entities/character-stat-base/character-stat-base-model.ts
// CharacterStatBase model organism — one base_value per (character_class, stat) pair.
// Pre-binds CHARACTER_STAT_BASE_CONFIG for Layer 2.

import { CHARACTER_STAT_BASE_CONFIG } from "@config/entities/character-stat-base";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import { buildSelectQuery } from "../../universal/atoms/build-select-query";
import { buildUpdateQuery } from "../../universal/atoms/build-update-query";
import { buildDeleteQuery } from "../../universal/atoms/build-delete-query";

export type CharacterStatBase = {
  readonly id: string;
  readonly character_id: string;
  readonly stat_id: string;
  readonly combination_type: string;
  readonly base_value: number;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const CharacterStatBaseModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(CHARACTER_STAT_BASE_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(CHARACTER_STAT_BASE_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): CharacterStatBase {
    return deserializeEntity(CHARACTER_STAT_BASE_CONFIG, row) as CharacterStatBase;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(CHARACTER_STAT_BASE_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(CHARACTER_STAT_BASE_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(CHARACTER_STAT_BASE_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(CHARACTER_STAT_BASE_CONFIG, conditions);
  },
};
