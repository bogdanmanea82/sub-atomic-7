// src/model/universal/atoms/build-query.ts
// Orchestrates query-building sub-atoms into complete SQL statements
// Composes SELECT, INSERT, UPDATE, DELETE queries from sub-atom pieces

import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "../sub-atoms/types/prepared-query";
import { queryBuildSelect } from "../sub-atoms/query-building";
import { queryBuildInsert } from "../sub-atoms/query-building";
import { queryBuildUpdate } from "../sub-atoms/query-building";
import { queryBuildWhere } from "../sub-atoms/query-building";

/**
 * Builds a SELECT query for retrieving entities.
 * Composes: SELECT clause + optional WHERE clause
 */

export function buildSelectQuery(
  config: EntityConfig,
  conditions?: Record<string, unknown>,
): PreparedQuery {
  // Extract field names from config for SELECT clause
  const fieldNames = config.fields.map((field) => field.name);
  const selectClause = queryBuildSelect(config.tableName, fieldNames);

  // If no conditions, return simple SELECT
  if (!conditions || Object.keys(conditions).length === 0) {
    return { sql: selectClause, params: [] };
  }

  // Add WHERE clause for filtered queries
  const whereClause = queryBuildWhere(conditions);

  return {
    sql: `${selectClause} ${whereClause.sql}`,
    params: whereClause.params,
  };
}

/**
 * Builds an INSERT query for creating entities.
 * Uses queryBuildInsert sub-atom directly.
 */

export function buildInsertQuery(
  config: EntityConfig,
  data: Record<string, unknown>,
): PreparedQuery {
  return queryBuildInsert(config.tableName, data);
}

/**
 * Builds an UPDATE query for modifying entities.
 * Composes: UPDATE clause + WHERE clause
 */

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

/**
 * Builds a DELETE query for removing entities.
 * Composes: DELETE FROM + WHERE clause
 */

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
