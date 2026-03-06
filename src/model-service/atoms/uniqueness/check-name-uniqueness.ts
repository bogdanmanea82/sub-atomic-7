// src/model-service/atoms/uniqueness/check-name-uniqueness.ts
// Checks whether a name is unique within an optional scope.
// Used by entity service create() and update() methods to enforce business rules.

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { selectManyWorkflow } from "../../molecules/workflows/select-many-workflow";

/**
 * Minimal model interface — only needs prepareSelect and deserialize.
 */
interface UniquenessModel {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): { id: string };
}

type UniquenessResult =
  | { readonly available: true }
  | { readonly available: false; readonly error: string };

/**
 * Checks whether a name is available (unique) within an optional scope.
 *
 * @param db - Database connection
 * @param model - Entity model with prepareSelect/deserialize
 * @param name - The name value to check
 * @param errorMessage - Pre-formatted error message for uniqueness violations
 * @param scope - Optional parent scope conditions (e.g., { game_domain_id: "uuid" })
 * @param excludeId - ID to exclude on updates (so the current record doesn't conflict with itself)
 */
export async function checkNameUniqueness(
  db: SQL,
  model: UniquenessModel,
  name: string,
  errorMessage: string,
  scope?: Record<string, unknown>,
  excludeId?: string,
): Promise<UniquenessResult> {
  const conditions: Record<string, unknown> = { name, ...scope };
  const existing = await selectManyWorkflow(db, model, conditions);

  if (!existing.success) {
    return { available: true };
  }

  const conflicts = excludeId
    ? existing.data.filter((d) => d.id !== excludeId)
    : existing.data;

  if (conflicts.length > 0) {
    return { available: false, error: errorMessage };
  }

  return { available: true };
}
