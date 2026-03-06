// src/model-service/molecules/workflows/delete-entity-workflow.ts
// Universal entity delete workflow — verify existence, delete, confirm removal

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { deleteRecord } from "../../atoms/crud";

/**
 * Minimum interface any Layer 1 model organism must satisfy
 * to be used with this workflow.
 */
interface EntityModel {
  prepareDelete(conditions: Record<string, unknown>): PreparedQuery;
}

/**
 * Two meaningful outcomes: deleted successfully, record was not found,
 * or a database error occurred.
 */
export type DeleteWorkflowResult =
  | { readonly success: true }
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
 * Deletes an entity by ID.
 * deleteRecord returns true if a row was removed, false if nothing matched.
 * config is needed for tableName passed into prepareDelete conditions.
 */
export async function deleteEntityWorkflow(
  db: SQL,
  model: EntityModel,
  id: string,
): Promise<DeleteWorkflowResult> {
  let query: PreparedQuery;
  try {
    query = model.prepareDelete({ id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, stage: "database", error: message };
  }

  try {
    const deleted = await deleteRecord(db, query);
    if (!deleted) {
      return {
        success: false,
        stage: "not_found",
        error: `Record ${id} not found`,
      };
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return { success: false, stage: "database", error: message };
  }
}
