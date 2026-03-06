// src/model-service/molecules/workflows/update-entity-workflow.ts
// Universal entity update workflow — validate, write change, fetch updated record

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { updateRecord, selectById } from "../../atoms/crud";

/**
 * Minimum interface any Layer 1 model organism must satisfy
 * to be used with this workflow.
 */
interface UpdateEntityModel<TEntity> {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  prepareUpdate(
    data: Record<string, unknown>,
    conditions: Record<string, unknown>,
  ): PreparedQuery;
  deserialize(row: Record<string, unknown>): TEntity;
}

/**
 * Three possible outcomes: success with updated data, validation failure,
 * not-found (no row matched the id), or database error.
 */
export type UpdateWorkflowResult<TEntity> =
  | { readonly success: true; readonly data: TEntity }
  | {
      readonly success: false;
      readonly stage: "validation";
      readonly errors: Record<string, string>;
    }
  | {
      readonly success: false;
      readonly stage: "not_found";
      readonly error: string;
    }
  | {
      readonly success: false;
      readonly stage: "database";
      readonly error: string;
    };

/**
 * Updates an entity by ID, then fetches and returns the updated record.
 */
export async function updateEntityWorkflow<TEntity>(
  db: SQL,
  model: UpdateEntityModel<TEntity>,
  id: string,
  data: Record<string, unknown>,
): Promise<UpdateWorkflowResult<TEntity>> {
  // Build and execute the UPDATE query
  let query: PreparedQuery;
  try {
    query = model.prepareUpdate(data, { id });
  } catch (error) {
    const err = error as Error & { errors?: Record<string, string> };
    return {
      success: false,
      stage: "validation",
      errors: err.errors ?? { general: err.message },
    };
  }

  try {
    await updateRecord(db, query);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, stage: "database", error: message };
  }

  // Fetch the updated record back — Layer 1 builds the SELECT query
  const selectQuery = model.prepareSelect({ id });
  const row = await selectById(db, selectQuery);
  if (!row) {
    return {
      success: false,
      stage: "not_found",
      error: `Record ${id} not found after update`,
    };
  }

  return { success: true, data: model.deserialize(row) };
}