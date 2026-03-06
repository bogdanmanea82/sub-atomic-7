// src/model/universal/atoms/build-insert-query.ts
// Builds an INSERT query for creating entities
// Delegates directly to queryBuildInsert sub-atom

import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
import { queryBuildInsert } from "../sub-atoms/query-building";

export function buildInsertQuery(
  config: EntityConfig,
  data: Record<string, unknown>,
): PreparedQuery {
  return queryBuildInsert(config.tableName, data);
}
