// src/model/entities/game-domain/game-domain-model.ts
  // GameDomain model organism — entity-specific Layer 1 public interface
  // Pre-binds GAME_DOMAIN_CONFIG so Layer 2 works with named operations, not raw config

  import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";
  import type { PreparedQuery } from "../../universal/sub-atoms/types/prepared-query";
  import type { ValidatedData } from "../../universal/atoms/validate-entity";
  import type { SerializedData } from "../../universal/atoms/serialize-entity";
  import { validateEntity } from "../../universal/atoms/validate-entity";
  import { serializeEntity } from "../../universal/atoms/serialize-entity";
  import { deserializeEntity } from "../../universal/atoms/deserialize-entity";
  import { createEntity } from "../../universal/molecules/create-entity";
  import {
    buildSelectQuery,
    buildUpdateQuery,
    buildDeleteQuery,
  } from "../../universal/atoms/build-query";

  /**
   * The TypeScript type for a deserialized GameDomain entity.
   * This is what Layer 2 and above work with.
   */
  export type GameDomain = {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };

  /**
   * GameDomain model organism.
   * Pre-binds GAME_DOMAIN_CONFIG to all universal operations.
   * Layer 2 imports this — never the underlying atoms or molecules directly.
   */
  export const GameDomainModel = {
    validate(input: Record<string, unknown>): ValidatedData {
      return validateEntity(GAME_DOMAIN_CONFIG, input);
    },

    serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
      return serializeEntity(GAME_DOMAIN_CONFIG, data, operation);
    },

    deserialize(row: Record<string, unknown>): GameDomain {
      return deserializeEntity(GAME_DOMAIN_CONFIG, row) as GameDomain;
    },

    prepareCreate(input: Record<string, unknown>): PreparedQuery {
      return createEntity(GAME_DOMAIN_CONFIG, input);
    },

    prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
      return buildSelectQuery(GAME_DOMAIN_CONFIG, conditions);
    },

    prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
      return buildUpdateQuery(GAME_DOMAIN_CONFIG, data, conditions);
    },

    prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
      return buildDeleteQuery(GAME_DOMAIN_CONFIG, conditions);
    },
  };