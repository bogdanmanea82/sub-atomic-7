// src/model-service/molecules/workflows/create-entity-workflow.ts                                                                                                                                                                           // Universal entity creation workflow — works with any entity model and config
import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { insertRecord, selectById } from "../../atoms/crud";

/**
 * The minimum interface any Layer 1 model organism must satisfy
 * to be used with this workflow.
 */
interface CreateEntityModel<TEntity> {
  prepareCreate(input: Record<string, unknown>): PreparedQuery;
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): TEntity;
}

/**
 * Three possible outcomes from a create operation.
 * Layer 3 maps these to HTTP status codes.
 */
export type CreateWorkflowResult<TEntity> =
  | { readonly success: true; readonly data: TEntity }
  | {
      readonly success: false;
      readonly stage: "validation";
      readonly errors: Record<string, string>;
    }
  | {
      readonly success: false;
      readonly stage: "database";
      readonly error: string;
    };

/**
 * Orchestrates entity creation across Layer 1 and Layer 2.
 * Works with any entity — receives model and config as parameters.
 * Layer 2 owns: ID generation, database execution, result assembly.
 * Layer 1 owns: validation, serialization, query building.
 */
export async function createEntityWorkflow<TEntity>(
  db: SQL,
  model: CreateEntityModel<TEntity>,
  input: Record<string, unknown>,
): Promise<CreateWorkflowResult<TEntity>> {
  // Step 1: Generate UUID — system fields are Layer 2's responsibility
  const id = crypto.randomUUID();
  const inputWithId = { ...input, id };

  // Step 2: Layer 1 prepares the query — validates, serializes, builds INSERT
  let query: PreparedQuery;
  try {
    query = model.prepareCreate(inputWithId);
  } catch (error) {
    const err = error as Error & { errors?: Record<string, string> };
    return {
      success: false,
      stage: "validation",
      errors: err.errors ?? { general: err.message },
    };
  }

  // Step 3: Execute INSERT — first database side effect
  try {
    await insertRecord(db, query);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, stage: "database", error: message };
  }

  // Step 4: Fetch the created record — Layer 1 builds the SELECT query
  const selectQuery = model.prepareSelect({ id });
  const row = await selectById(db, selectQuery);
  if (!row) {
    return {
      success: false,
      stage: "database",
      error: "Failed to retrieve created record",
    };
  }

  // Step 5: Deserialize database row into typed entity and return
  return { success: true, data: model.deserialize(row) };
}
