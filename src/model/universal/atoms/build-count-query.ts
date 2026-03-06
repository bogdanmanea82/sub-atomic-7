// src/model/universal/atoms/build-count-query.ts
// Builds a COUNT query to get total records matching conditions
// Used alongside paginated SELECT to compute total pages

import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
import { queryBuildCount } from "../sub-atoms/query-building";
import { queryBuildWhere } from "../sub-atoms/query-building";

export function buildCountQuery(
  config: EntityConfig,
  conditions?: Record<string, unknown>,
): PreparedQuery {
  const countClause = queryBuildCount(config.tableName);

  if (!conditions || Object.keys(conditions).length === 0) {
    return { sql: countClause, params: [] };
  }

  const whereClause = queryBuildWhere(conditions);
  return {
    sql: `${countClause} ${whereClause.sql}`,
    params: whereClause.params,
  };
}
