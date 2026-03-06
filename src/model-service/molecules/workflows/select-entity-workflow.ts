// src/model-service/molecules/workflows/select-entity-workflow.ts
// Universal entity select-by-ID workflow — fetch one record and deserialize it
import type { SQL } from "bun";
import type { EntityConfig } from "@config/types";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { selectById } from "../../atoms/crud";

/**
 * The minimum interface any Layer 1 model organism must satisfy
 * to be used with this workflow.
 */
interface EntityModel<TEntity> {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): TEntity;
}

/**
 * Two possible outcomes — either the record exists or it doesn't.
 * No validation stage: selecting by ID has no user input to validate.
 */
export type SelectWorkflowResult<TEntity> =
  | { readonly success: true; readonly data: TEntity }
  | { readonly success: false; readonly stage: "not_found"; readonly error: string }
  | { readonly success: false; readonly stage: "database"; readonly error: string };

/**
 * Fetches a single entity by ID and deserializes it into a typed result.
 * Works with any entity — receives model and config as parameters.
 */
export async function selectEntityWorkflow<TEntity>(
  db: SQL,
  config: EntityConfig,
  model: EntityModel<TEntity>,
  id: string,
): Promise<SelectWorkflowResult<TEntity>> {
  const query = model.prepareSelect({ id });
  const row = await selectById(db, query);

  if (!row) {
    return {
      success: false,
      stage: "not_found",
      error: `${config.displayName} with id ${id} not found`,
    };
  }

  return { success: true, data: model.deserialize(row) };
}
