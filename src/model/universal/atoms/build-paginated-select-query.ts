// src/model/universal/atoms/build-paginated-select-query.ts
// Builds a paginated SELECT query with ORDER BY, LIMIT, and OFFSET
// Composes: SELECT + optional WHERE + ORDER BY + LIMIT/OFFSET

import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
import type { PaginationParams } from "../sub-atoms/types/pagination-params";
import { queryBuildSelect } from "../sub-atoms/query-building";
import { queryBuildWhere } from "../sub-atoms/query-building";
import { queryBuildOrderBy } from "../sub-atoms/query-building";
import { queryBuildPagination } from "../sub-atoms/query-building";

export function buildPaginatedSelectQuery(
  config: EntityConfig,
  pagination: PaginationParams,
  conditions?: Record<string, unknown>,
): PreparedQuery {
  const fieldNames = config.fields.map((field) => field.name);
  const selectClause = queryBuildSelect(config.tableName, fieldNames);
  const orderClause = queryBuildOrderBy("created_at", "DESC");
  const limitClause = queryBuildPagination(pagination.page, pagination.pageSize);

  if (!conditions || Object.keys(conditions).length === 0) {
    return {
      sql: `${selectClause} ${orderClause} ${limitClause.sql}`,
      params: limitClause.params,
    };
  }

  const whereClause = queryBuildWhere(conditions);
  return {
    sql: `${selectClause} ${whereClause.sql} ${orderClause} ${limitClause.sql}`,
    params: [...whereClause.params, ...limitClause.params],
  };
}
