// src/model-service/atoms/crud/verify-entity-exists.ts
// Checks whether a record with the given ID exists in the database.
// Used by services that need to verify a parent entity exists before
// operating on its subordinates (e.g. bindings, tiers).

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { selectMany } from "./select-many";

type SelectableModel = {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
};

/**
 * Returns true if a record with the given ID exists, false otherwise.
 */
export async function verifyEntityExists(
  db: SQL,
  model: SelectableModel,
  id: string,
): Promise<boolean> {
  const query = model.prepareSelect({ id });
  const rows = await selectMany(db, query);
  return rows.length > 0;
}
