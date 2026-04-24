// src/model/entities/item-modifier/item-modifier-model.ts
// ItemModifier model organism — entity-specific Layer 1 public interface

import { ITEM_MODIFIER_CONFIG } from "@config/entities/item-modifier";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { PaginationParams } from "../../universal/sub-atoms/types/pagination-params";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import { buildSelectQuery } from "../../universal/atoms/build-select-query";
import { buildPaginatedSelectQuery } from "../../universal/atoms/build-paginated-select-query";
import { buildCountQuery } from "../../universal/atoms/build-count-query";
import { buildUpdateQuery } from "../../universal/atoms/build-update-query";
import { buildDeleteQuery } from "../../universal/atoms/build-delete-query";

/**
 * The TypeScript type for a deserialized ItemModifier entity.
 * Includes all four parent FK fields, item classification, mechanical fields,
 * and archive lifecycle.
 */
export type ItemModifier = {
  readonly id: string;
  readonly game_domain_id: string;
  readonly game_subdomain_id: string;
  readonly game_category_id: string;
  readonly game_subcategory_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly affix_type: string;
  readonly target_stat_id: string | null;
  readonly combination_type: string;
  readonly roll_shape: string;
  readonly value_min: number;
  readonly value_max: number;
  readonly modifier_group: string;
  readonly display_template: string;
  readonly is_active: boolean;
  readonly archived_at: Date | null;
  readonly archived_reason: string | null;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const ItemModifierModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(ITEM_MODIFIER_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(ITEM_MODIFIER_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): ItemModifier {
    return deserializeEntity(ITEM_MODIFIER_CONFIG, row) as ItemModifier;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(ITEM_MODIFIER_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(ITEM_MODIFIER_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(ITEM_MODIFIER_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(ITEM_MODIFIER_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(ITEM_MODIFIER_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(ITEM_MODIFIER_CONFIG, conditions);
  },
};
