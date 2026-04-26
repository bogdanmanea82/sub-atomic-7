// src/model/entities/game-subcategory/game-subcategory-model.ts
// GameSubcategory model organism — entity-specific Layer 1 public interface

import { GAME_SUBCATEGORY_CONFIG } from "@config/entities/game-subcategory";
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
 * The TypeScript type for a deserialized GameSubcategory entity.
 * Includes all three parent foreign keys for the full hierarchy.
 */
export type GameSubcategory = {
  readonly id: string;
  readonly game_domain_id: string;
  readonly game_subdomain_id: string;
  readonly game_category_id: string;
  readonly machine_name: string;
  readonly name: string;
  readonly description: string | null;
  readonly is_active: boolean;
  readonly archived_at: Date | null;
  readonly archived_reason: string | null;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const GameSubcategoryModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(GAME_SUBCATEGORY_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(GAME_SUBCATEGORY_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): GameSubcategory {
    return deserializeEntity(GAME_SUBCATEGORY_CONFIG, row) as GameSubcategory;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(GAME_SUBCATEGORY_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(GAME_SUBCATEGORY_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(GAME_SUBCATEGORY_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(GAME_SUBCATEGORY_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(GAME_SUBCATEGORY_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(GAME_SUBCATEGORY_CONFIG, conditions);
  },
};
