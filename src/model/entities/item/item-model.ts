// src/model/entities/item/item-model.ts
// Layer 1 organism — Item type and query builder.
// Item is a template entity representing one rollable base type in the hierarchy.

import { ITEM_CONFIG } from "@config/entities/item";
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

export type Item = {
  readonly id: string;
  readonly game_domain_id: string;
  readonly game_subdomain_id: string;
  readonly game_category_id: string;
  readonly game_subcategory_id: string;
  readonly machine_name: string;
  readonly name: string;
  readonly description: string | null;
  readonly is_active: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;
};

export const ItemModel = {
  validate(input: Record<string, unknown>): ValidatedData {
    return validateEntity(ITEM_CONFIG, input);
  },

  serialize(data: Record<string, unknown>, operation: "create" | "update"): SerializedData {
    return serializeEntity(ITEM_CONFIG, data, operation);
  },

  deserialize(row: Record<string, unknown>): Item {
    return deserializeEntity(ITEM_CONFIG, row) as Item;
  },

  prepareCreate(input: Record<string, unknown>): PreparedQuery {
    return createEntity(ITEM_CONFIG, input);
  },

  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery {
    return buildSelectQuery(ITEM_CONFIG, conditions);
  },

  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery {
    return buildPaginatedSelectQuery(ITEM_CONFIG, pagination, conditions);
  },

  prepareCount(conditions?: Record<string, unknown>): PreparedQuery {
    return buildCountQuery(ITEM_CONFIG, conditions);
  },

  prepareUpdate(data: Record<string, unknown>, conditions: Record<string, unknown>): PreparedQuery {
    return buildUpdateQuery(ITEM_CONFIG, data, conditions);
  },

  prepareDelete(conditions: Record<string, unknown>): PreparedQuery {
    return buildDeleteQuery(ITEM_CONFIG, conditions);
  },
};
