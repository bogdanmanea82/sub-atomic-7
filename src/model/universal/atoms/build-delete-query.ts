// src/model/universal/atoms/build-delete-query.ts
// Builds a DELETE query for removing entities
// Composes: DELETE FROM + WHERE clause

import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
import { queryBuildWhere } from "../sub-atoms/query-building";

export function buildDeleteQuery(
  config: EntityConfig,
  conditions: Record<string, unknown>,
): PreparedQuery {
  const whereClause = queryBuildWhere(conditions);

  return {
    sql: `DELETE FROM ${config.tableName} ${whereClause.sql} RETURNING "id"`,
    params: whereClause.params,
  };
}
