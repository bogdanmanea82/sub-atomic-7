// src/model/entities/modifier/modifier-model.ts
// Modifier model organism — entity-specific Layer 1 public interface

import { MODIFIER_CONFIG } from "@config/entities/modifier";
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
 * The TypeScript type for a deserialized Modifier entity.
 * Includes all four hierarchy FK fields, mechanical fields, and archive lifecycle.
 * affix_type is NOT here — it lives on ItemModifierBinding (item-specific).
 */
export type Modifier = {
  readonly id: string;
  readonly game_domain_id: string;
  readonly game_subdomain_id: string;
  readonly game_category_id: string;
  readonly game_subcategory_id: string;
  readonly machine_name: string;
  readonly name: string;
  readonly description: string | null;
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

export const ModifierModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(MODIFIER_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(MODIFIER_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): Modifier {
    return deserializeEntity(MODIFIER_CONFIG, row) as Modifier;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(MODIFIER_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(MODIFIER_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(MODIFIER_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(MODIFIER_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(MODIFIER_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(MODIFIER_CONFIG, conditions);
  },
};
