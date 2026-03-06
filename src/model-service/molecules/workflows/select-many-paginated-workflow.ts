// src/model-service/molecules/workflows/select-many-paginated-workflow.ts
// Universal paginated select workflow — fetches a page of records plus total count

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { selectMany } from "../../atoms/crud";
import { executeSelect } from "../../sub-atoms/database";

/**
 * The minimum interface a model organism must satisfy for paginated queries.
 * Extends the basic model with pagination-aware query builders.
 */
interface PaginatedEntityModel<TEntity> {
  preparePaginatedSelect(pagination: PaginationParams, conditions?: Record<string, unknown>): PreparedQuery;
  prepareCount(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): TEntity;
}

/**
 * Paginated result includes both the data page and totalCount for page calculation.
 */
export type SelectManyPaginatedResult<TEntity> =
  | {
      readonly success: true;
      readonly data: TEntity[];
      readonly totalCount: number;
    }
  | {
      readonly success: false;
      readonly stage: "database";
      readonly error: string;
    };

/**
 * Fetches a single page of entities and the total matching count in parallel.
 * The count query runs alongside the data query — no extra round-trip latency.
 */
export async function selectManyPaginatedWorkflow<TEntity>(
  db: SQL,
  model: PaginatedEntityModel<TEntity>,
  pagination: PaginationParams,
  conditions?: Record<string, unknown>,
): Promise<SelectManyPaginatedResult<TEntity>> {
  try {
    const dataQuery = model.preparePaginatedSelect(pagination, conditions);
    const countQuery = model.prepareCount(conditions);

    const [rows, countRows] = await Promise.all([
      selectMany(db, dataQuery),
      executeSelect(db, countQuery),
    ]);

    const totalCount = (countRows[0]?.["total"] as number) ?? 0;
    const data = rows.map((row) => model.deserialize(row));

    return { success: true, data, totalCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, stage: "database", error: message };
  }
}
