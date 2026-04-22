// src/model-service/atoms/uniqueness/check-composite-uniqueness.ts
// Checks whether any records exist that match a composite set of conditions.
// The multi-column equivalent of checkFieldUniqueness — used when uniqueness
// is defined by two or more fields together rather than a single field.
//
// If excludeId is provided, the record with that ID is excluded from the
// conflict check, so a record can be updated without conflicting with itself.

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { selectMany } from "../crud/select-many";

type SelectableModel = {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
};

/**
 * Returns true if a conflicting record exists (i.e. uniqueness would be violated),
 * false if the combination is available.
 */
export async function checkCompositeUniqueness(
  db: SQL,
  model: SelectableModel,
  conditions: Record<string, unknown>,
  excludeId?: string,
): Promise<boolean> {
  const query = model.prepareSelect(conditions);
  const rows = await selectMany(db, query);
  const conflicts = excludeId
    ? rows.filter((r) => r["id"] !== excludeId)
    : rows;
  return conflicts.length > 0;
}
