// src/model-service/atoms/uniqueness/check-field-uniqueness.ts
// Checks whether a field value is unique within an optional scope.
// Generalized version of checkNameUniqueness — works with any field name.

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { selectManyWorkflow } from "../../molecules/workflows/select-many-workflow";

interface UniquenessModel {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): { id: string };
}

type UniquenessResult =
  | { readonly available: true }
  | { readonly available: false; readonly error: string };

/**
 * Checks whether a field value is available (unique) within an optional scope.
 *
 * @param db - Database connection
 * @param model - Entity model with prepareSelect/deserialize
 * @param fieldName - The field to check (e.g., "name", "code")
 * @param value - The value to check
 * @param errorMessage - Pre-formatted error message for uniqueness violations
 * @param scope - Optional parent scope conditions (e.g., { game_subcategory_id: "uuid" })
 * @param excludeId - ID to exclude on updates
 */
export async function checkFieldUniqueness(
  db: SQL,
  model: UniquenessModel,
  fieldName: string,
  value: string,
  errorMessage: string,
  scope?: Record<string, unknown>,
  excludeId?: string,
): Promise<UniquenessResult> {
  const conditions: Record<string, unknown> = { [fieldName]: value, ...scope };
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
