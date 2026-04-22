// src/model-service/sub-atoms/tiers/insert-tiers.ts
// Writes a full tier set for one modifier inside an already-open transaction.
// The model is passed in so this sub-atom works for any modifier tier type.
//
// FK convention: tier tables use "modifier_id" as the FK column name by default.
// Pass fkFieldName explicitly for any tier table that uses a different column name.

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import type { TierInput } from "../../atoms/validation/validate-tier-set";
import { insertRecord } from "../../atoms/crud";

/** Minimal model interface required — only prepareCreate is needed. */
export type TierCreateModel = {
  prepareCreate(input: Record<string, unknown>): PreparedQuery;
};

export async function insertTiers(
  txDb: SQL,
  model: TierCreateModel,
  modifierId: string,
  tiers: readonly TierInput[],
  fkFieldName = "modifier_id",
): Promise<void> {
  for (const tier of tiers) {
    const tierInput: Record<string, unknown> = {
      id: crypto.randomUUID(),
      [fkFieldName]: modifierId,
      tier_index: tier.tier_index,
      min_value: tier.min_value,
      max_value: tier.max_value,
      level_req: tier.level_req,
      spawn_weight: tier.spawn_weight,
    };
    const query = model.prepareCreate(tierInput);
    await insertRecord(txDb, query);
  }
}
