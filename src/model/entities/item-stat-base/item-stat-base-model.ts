// src/model/entities/item-stat-base/item-stat-base-model.ts
// Layer 1 organism — ItemStatBase junction type and query builder.
// One row per (item, stat) pair, carrying the implicit base_value and combination_type.

import { ITEM_STAT_BASE_CONFIG } from "@config/entities/item-stat-base";
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

export type ItemStatBase = {
  readonly id: string;
  readonly item_id: string;
  readonly stat_id: string;
  readonly combination_type: string;
  readonly base_value: number;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const ItemStatBaseModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(ITEM_STAT_BASE_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(ITEM_STAT_BASE_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): ItemStatBase {
    return deserializeEntity(ITEM_STAT_BASE_CONFIG, row) as ItemStatBase;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(ITEM_STAT_BASE_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(ITEM_STAT_BASE_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(ITEM_STAT_BASE_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(ITEM_STAT_BASE_CONFIG, conditions);
  },
};
