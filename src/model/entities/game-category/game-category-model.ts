// src/model/entities/game-category/game-category-model.ts
// GameCategory model organism — entity-specific Layer 1 public interface
// Pre-binds GAME_CATEGORY_CONFIG so Layer 2 works with named operations, not raw config

import { GAME_CATEGORY_CONFIG } from "@config/entities/game-category";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { PaginationParams } from "../../universal/sub-atoms/types/pagination-params";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import {
  buildSelectQuery,
  buildPaginatedSelectQuery,
  buildCountQuery,
  buildUpdateQuery,
  buildDeleteQuery,
} from "../../universal/atoms/build-query";

/**
 * The TypeScript type for a deserialized GameCategory entity.
 * Includes both game_domain_id and game_subdomain_id — the two parent foreign keys.
 */
export type GameCategory = {
  readonly id: string;
  readonly game_domain_id: string;
  readonly game_subdomain_id: string;
  readonly name: string;
  readonly description: string | null;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
};

/**
 * GameCategory model organism.
 * Pre-binds GAME_CATEGORY_CONFIG to all universal operations.
 */
export const GameCategoryModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(GAME_CATEGORY_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(GAME_CATEGORY_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): GameCategory {
    return deserializeEntity(GAME_CATEGORY_CONFIG, row) as GameCategory;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(GAME_CATEGORY_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(GAME_CATEGORY_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(GAME_CATEGORY_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(GAME_CATEGORY_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(GAME_CATEGORY_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(GAME_CATEGORY_CONFIG, conditions);
  },
};
