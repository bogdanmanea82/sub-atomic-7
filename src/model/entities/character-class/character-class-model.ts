// src/model/entities/character-class/character-class-model.ts
// CharacterClass model organism — pre-binds CHARACTER_CLASS_CONFIG for Layer 2.

import { CHARACTER_CLASS_CONFIG } from "@config/entities/character-class";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import type { PaginationParams } from "../../universal/sub-atoms/types/pagination-params";
import { buildSelectQuery } from "../../universal/atoms/build-select-query";
import { buildPaginatedSelectQuery } from "../../universal/atoms/build-paginated-select-query";
import { buildCountQuery } from "../../universal/atoms/build-count-query";
import { buildUpdateQuery } from "../../universal/atoms/build-update-query";
import { buildDeleteQuery } from "../../universal/atoms/build-delete-query";

export type CharacterClass = {
  readonly id: string;
  readonly machine_name: string;
  readonly name: string;
  readonly description: string | null;
  readonly is_active: boolean;
  readonly archived_at: Date | null;
  readonly archived_reason: string | null;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const CharacterClassModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(CHARACTER_CLASS_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(CHARACTER_CLASS_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): CharacterClass {
    return deserializeEntity(CHARACTER_CLASS_CONFIG, row) as CharacterClass;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(CHARACTER_CLASS_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(CHARACTER_CLASS_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(CHARACTER_CLASS_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(CHARACTER_CLASS_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(CHARACTER_CLASS_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(CHARACTER_CLASS_CONFIG, conditions);
  },
};
