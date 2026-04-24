// src/model/entities/stat/stat-model.ts
// Stat model organism — entity-specific Layer 1 public interface.
// Pre-binds STAT_CONFIG so Layer 2 works with named operations, not raw config.

import { STAT_CONFIG } from "@config/entities/stat";
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

export type Stat = {
  readonly id: string;
  readonly machine_name: string;
  readonly name: string;
  readonly description: string | null;
  readonly data_type: string;
  readonly value_min: number;
  readonly value_max: number;
  readonly default_value: number;
  readonly category: string;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const StatModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(STAT_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(STAT_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): Stat {
    return deserializeEntity(STAT_CONFIG, row) as Stat;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(STAT_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(STAT_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(STAT_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(STAT_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(STAT_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(STAT_CONFIG, conditions);
  },
};
