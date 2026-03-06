// src/model/entities/game-subdomain/game-subdomain-model.ts
// GameSubdomain model organism — entity-specific Layer 1 public interface
// Pre-binds GAME_SUBDOMAIN_CONFIG so Layer 2 works with named operations, not raw config

import { GAME_SUBDOMAIN_CONFIG } from "@config/entities/game-subdomain";
import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
import type { ValidatedData } from "../../universal/atoms/validate-entity";
import type { SerializedData } from "../../universal/atoms/serialize-entity";
import { validateEntity } from "../../universal/atoms/validate-entity";
import { serializeEntity } from "../../universal/atoms/serialize-entity";
import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
import { createEntity } from "../../universal/molecules/create-entity";
import type { PaginationParams } from "../../universal/sub-atoms/types/pagination-params";
import {
  buildSelectQuery,
  buildPaginatedSelectQuery,
  buildCountQuery,
  buildUpdateQuery,
  buildDeleteQuery,
} from "../../universal/atoms/build-query";

/**
 * The TypeScript type for a deserialized GameSubdomain entity.
 * Includes game_domain_id — the foreign key linking to the parent GameDomain.
 */
export type GameSubdomain = {
  readonly id: string;
  readonly game_domain_id: string;
  readonly name: string;
  readonly description: string | null;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
};

/**
 * GameSubdomain model organism.
 * Pre-binds GAME_SUBDOMAIN_CONFIG to all universal operations.
 * Layer 2 imports this — never the underlying atoms or molecules directly.
 */
export const GameSubdomainModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(GAME_SUBDOMAIN_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(GAME_SUBDOMAIN_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): GameSubdomain {
    return deserializeEntity(GAME_SUBDOMAIN_CONFIG, row) as GameSubdomain;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(GAME_SUBDOMAIN_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(GAME_SUBDOMAIN_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(GAME_SUBDOMAIN_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(GAME_SUBDOMAIN_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(GAME_SUBDOMAIN_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(GAME_SUBDOMAIN_CONFIG, conditions);
  },
};
