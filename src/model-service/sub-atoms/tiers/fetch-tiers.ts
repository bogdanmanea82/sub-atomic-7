// src/model-service/sub-atoms/tiers/fetch-tiers.ts
// Fetches and deserializes all tier rows for a modifier, sorted ascending by tier_index.
// The model is passed in so this sub-atom works for any modifier tier type.
//
// FK convention: tier tables use "modifier_id" as the FK column name by default.
// Pass fkFieldName explicitly for any tier table that uses a different column name.

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { selectMany } from "../../atoms/crud";

/** Minimal model interface required — prepareSelect + deserialize. */
export type TierSelectModel<T> = {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): T;
};

export async function fetchTiers<T extends { tier_index: number }>(
  db: SQL,
  model: TierSelectModel<T>,
  modifierId: string,
  fkFieldName = "modifier_id",
): Promise<T[]> {
  const query = model.prepareSelect({ [fkFieldName]: modifierId });
  const rows = await selectMany(db, query);
  return rows
    .map((row) => model.deserialize(row))
    .sort((a, b) => a.tier_index - b.tier_index);
}
