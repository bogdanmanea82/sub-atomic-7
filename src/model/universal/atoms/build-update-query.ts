// src/model/universal/atoms/build-update-query.ts
// Builds an UPDATE query for modifying entities
// Composes: UPDATE clause + WHERE clause

import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
import { queryBuildUpdate } from "../sub-atoms/query-building";
import { queryBuildWhere } from "../sub-atoms/query-building";

export function buildUpdateQuery(
  config: EntityConfig,
  data: Record<string, unknown>,
  conditions: Record<string, unknown>,
): PreparedQuery {
  const updateClause = queryBuildUpdate(config.tableName, data);
  const whereClause = queryBuildWhere(conditions);

  return {
    sql: `${updateClause.sql} ${whereClause.sql}`,
    params: [...updateClause.params, ...whereClause.params],
  };
}
