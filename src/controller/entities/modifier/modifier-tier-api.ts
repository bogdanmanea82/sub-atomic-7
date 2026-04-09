// src/controller/entities/modifier/modifier-tier-api.ts
// REST API endpoints for individual tier CRUD on a modifier's detail page.
// Each operation loads current tiers, applies the change, validates the full set,
// then delegates persistence to ModifierService.replaceTiers().

import { Elysia } from "elysia";
import { ModifierService } from "@model-service/entities/modifier";
import { formatSuccess, formatError } from "../../sub-atoms/response";

interface TierInput {
  readonly tier_index: number;
  readonly min_value: number;
  readonly max_value: number;
  readonly level_req: number;
  readonly spawn_weight: number;
}

/**
 * Converts modifier tier records to plain TierInput format.
 */
function toTierInputs(tiers: readonly Record<string, unknown>[]): TierInput[] {
  return tiers.map((t) => ({
    tier_index: Number(t["tier_index"]),
    min_value: Number(t["min_value"]),
    max_value: Number(t["max_value"]),
    level_req: Number(t["level_req"]),
    spawn_weight: Number(t["spawn_weight"]),
  }));
}

export const ModifierTierApi = new Elysia()

  // ── Add a tier ──────────────────────────────────────────────────────────
  .post("/api/modifiers/:id/tiers", async ({ params, body, set }) => {
    const modifierId = params["id"];
    const input = body as Record<string, unknown>;

    const result = await ModifierService.findById(modifierId);
    if (!result.success) {
      set.status = 404;
      return formatError("Modifier not found");
    }

    const currentTiers = toTierInputs(result.data.tiers as unknown as Record<string, unknown>[]);
    const newTier: TierInput = {
      tier_index: currentTiers.length,
      min_value: Number(input["min_value"]),
      max_value: Number(input["max_value"]),
      level_req: Number(input["level_req"]),
      spawn_weight: Number(input["spawn_weight"]),
    };
    const updatedTiers = [...currentTiers, newTier];

    const persistResult = await ModifierService.replaceTiers(modifierId, updatedTiers);
    if (!persistResult.success) {
      set.status = 422;
      return formatError(persistResult.error);
    }
    return formatSuccess(persistResult.tiers);
  })

  // ── Update a tier ───────────────────────────────────────────────────────
  .put("/api/modifiers/:id/tiers/:tierIndex", async ({ params, body, set }) => {
    const modifierId = params["id"];
    const tierIndex = Number(params["tierIndex"]);
    const input = body as Record<string, unknown>;

    const result = await ModifierService.findById(modifierId);
    if (!result.success) {
      set.status = 404;
      return formatError("Modifier not found");
    }

    const currentTiers = toTierInputs(result.data.tiers as unknown as Record<string, unknown>[]);
    if (tierIndex < 0 || tierIndex >= currentTiers.length) {
      set.status = 404;
      return formatError(`Tier index ${tierIndex} not found`);
    }

    const updatedTiers = currentTiers.map((t) =>
      t.tier_index === tierIndex
        ? {
            tier_index: tierIndex,
            min_value: Number(input["min_value"]),
            max_value: Number(input["max_value"]),
            level_req: Number(input["level_req"]),
            spawn_weight: Number(input["spawn_weight"]),
          }
        : t,
    );

    const persistResult = await ModifierService.replaceTiers(modifierId, updatedTiers);
    if (!persistResult.success) {
      set.status = 422;
      return formatError(persistResult.error);
    }
    return formatSuccess(persistResult.tiers);
  })

  // ── Delete a tier ───────────────────────────────────────────────────────
  .delete("/api/modifiers/:id/tiers/:tierIndex", async ({ params, set }) => {
    const modifierId = params["id"];
    const tierIndex = Number(params["tierIndex"]);

    const result = await ModifierService.findById(modifierId);
    if (!result.success) {
      set.status = 404;
      return formatError("Modifier not found");
    }

    const currentTiers = toTierInputs(result.data.tiers as unknown as Record<string, unknown>[]);
    if (tierIndex < 0 || tierIndex >= currentTiers.length) {
      set.status = 404;
      return formatError(`Tier index ${tierIndex} not found`);
    }

    // Remove tier and reindex remaining
    const updatedTiers = currentTiers
      .filter((t) => t.tier_index !== tierIndex)
      .map((t, i) => ({ ...t, tier_index: i }));

    const persistResult = await ModifierService.replaceTiers(modifierId, updatedTiers);
    if (!persistResult.success) {
      set.status = 422;
      return formatError(persistResult.error);
    }
    return formatSuccess(persistResult.tiers);
  });
