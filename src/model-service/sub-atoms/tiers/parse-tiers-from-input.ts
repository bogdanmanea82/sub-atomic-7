// src/model-service/sub-atoms/tiers/parse-tiers-from-input.ts
// Parses the tiers_json hidden field from a form submission into typed tier inputs.
// Returns null on blank input or parse failure — callers treat null as "no tiers provided".

import type { TierInput } from "../../atoms/validation/validate-tier-set";

export function parseTiersFromInput(input: Record<string, unknown>): TierInput[] | null {
  const raw = input["tiers_json"];
  if (typeof raw !== "string" || raw.trim() === "") return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((t) => ({
      tier_index: Number(t["tier_index"]),
      min_value: Number(t["min_value"]),
      max_value: Number(t["max_value"]),
      level_req: Number(t["level_req"]),
      spawn_weight: Number(t["spawn_weight"]),
    }));
  } catch {
    return null;
  }
}
