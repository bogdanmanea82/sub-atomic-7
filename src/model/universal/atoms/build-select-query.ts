// src/model/universal/atoms/build-select-query.ts
// Builds a SELECT query for retrieving entities
// Composes: SELECT clause + optional WHERE clause

import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
import { queryBuildSelect } from "../sub-atoms/query-building";
import { queryBuildWhere } from "../sub-atoms/query-building";

export function buildSelectQuery(
  config: EntityConfig,
  conditions?: Record<string, unknown>,
): PreparedQuery {
  const fieldNames = config.fields.map((field) => field.name);
  const selectClause = queryBuildSelect(config.tableName, fieldNames);

  if (!conditions || Object.keys(conditions).length === 0) {
    return { sql: selectClause, params: [] };
  }

  const whereClause = queryBuildWhere(conditions);

  return {
    sql: `${selectClause} ${whereClause.sql}`,
    params: whereClause.params,
  };
}
