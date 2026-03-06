// src/model-service/molecules/workflows/select-many-workflow.ts
// Universal entity select-many workflow — fetch multiple records and deserialize them

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { selectMany } from "../../atoms/crud";

/**
 * The minimum interface any Layer 1 model organism must satisfy
 * to be used with this workflow.
 */
interface SelectManyEntityModel<TEntity> {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): TEntity;
}

/**
 * Two possible outcomes — either records are returned (possibly empty) or a database error.
 * An empty array is a valid success — zero results is not an error.
 */
export type SelectManyWorkflowResult<TEntity> =
  | { readonly success: true; readonly data: TEntity[] }
  | {
      readonly success: false;
      readonly stage: "database";
      readonly error: string;
    };

/**
 * Fetches multiple entities and deserializes each row into a typed result.
 * Works with any entity — receives model and config as parameters.
 */
export async function selectManyWorkflow<TEntity>(
  db: SQL,
  model: SelectManyEntityModel<TEntity>,
  conditions?: Record<string, unknown>,
): Promise<SelectManyWorkflowResult<TEntity>> {
  try {
    const query = model.prepareSelect(conditions);
    const rows = await selectMany(db, query);
    const data = rows.map((row) => model.deserialize(row));
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, stage: "database", error: message };
  }
}
