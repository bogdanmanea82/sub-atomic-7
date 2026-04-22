// src/model-service/sub-atoms/tiers/create-tier-orchestration.ts
// Factory that returns the four tier management methods (replaceTiers, addTier,
// updateTier, deleteTier) for any modifier type that owns a tier sub-entity.
//
// Usage:
//   const tierOrchestration = createTierOrchestration(
//     EnemyModifierTierModel,
//     (id) => EnemyModifierService.findById(id),
//     "enemy_modifier_id",          // optional — defaults to "modifier_id"
//   );
//   export const EnemyModifierService = { ...coreMethods, ...tierOrchestration };
//
// The findById parameter is a lazy closure so the parent service can reference
// itself — the closure is only called at runtime, after the service is defined.

import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { getConnection, withTransaction, executeWrite } from "../database";
import { insertTiers } from "./insert-tiers";
import { tierInputsFromTiers } from "./tier-inputs-from-tiers";
import type { HasTierFields } from "./tier-inputs-from-tiers";
import { validateTierSet, type TierInput } from "../../atoms/validation/validate-tier-set";

// ── Structural types ──────────────────────────────────────────────────────────

/**
 * Minimum interface for the tier sub-entity model.
 * Extends TierCreateModel (prepareCreate) with prepareDelete.
 */
export type TierOrchestrationModel = {
  prepareCreate(input: Record<string, unknown>): PreparedQuery;
  prepareDelete(conditions: Record<string, unknown>): PreparedQuery;
};

/** Structural shape of a successful findById result — only tiers[] is needed. */
type FindByIdSuccess<T> = { readonly success: true; readonly data: T };
type FindByIdFailure  = { readonly success: false; readonly [k: string]: unknown };
type FindByIdResult<T> = FindByIdSuccess<T> | FindByIdFailure;

/** The entity type constraint: must have a tiers array for tierInputsFromTiers(). */
export type HasTiers<T extends object = object> = T & {
  readonly tiers: readonly HasTierFields[];
};

// ── Result union types ─────────────────────────────────────────────────────────

export type ReplaceTiersResult =
  | { readonly success: true;  readonly tiers: readonly TierInput[] }
  | { readonly success: false; readonly error: string };

export type TierMutationResult =
  | { readonly success: true;  readonly tiers: readonly TierInput[] }
  | { readonly success: false; readonly stage: "not_found" | "validation"; readonly error: string };

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Returns the four tier management methods wired to the supplied tier model
 * and parent-entity lookup function.
 *
 * @param tierModel    Layer 1 model for the tier sub-entity (prepareCreate + prepareDelete).
 * @param findById     Lazy reference to the parent service's findById method.
 *                     Called at runtime — safe to pass `(id) => ParentService.findById(id)`
 *                     even though ParentService is declared after the factory call.
 * @param fkFieldName  Foreign-key column name in the tier table. Defaults to "modifier_id".
 */
export function createTierOrchestration<T extends HasTiers>(
  tierModel: TierOrchestrationModel,
  findById: (id: string) => Promise<FindByIdResult<T>>,
  fkFieldName = "modifier_id",
) {
  const self = {
    /**
     * Replaces the entire tier set for a parent entity.
     * Validates the set first (unless empty), then delete-all + re-insert inside a transaction.
     */
    async replaceTiers(
      parentId: string,
      tiers: readonly TierInput[],
    ): Promise<ReplaceTiersResult> {
      if (tiers.length > 0) {
        const validation = validateTierSet(tiers);
        if (!validation.valid) {
          return { success: false, error: Object.values(validation.errors).join("; ") };
        }
      }
      const db = getConnection();
      await withTransaction(db, async (txDb) => {
        await executeWrite(txDb, tierModel.prepareDelete({ [fkFieldName]: parentId }));
        await insertTiers(txDb, tierModel, parentId, tiers, fkFieldName);
      });
      return { success: true, tiers };
    },

    /**
     * Appends a new tier to the current set, auto-assigning the next tier_index.
     */
    async addTier(
      parentId: string,
      input: Record<string, unknown>,
    ): Promise<TierMutationResult> {
      const result = await findById(parentId);
      if (!result.success) {
        return { success: false, stage: "not_found", error: "Parent entity not found" };
      }
      const currentTiers = tierInputsFromTiers((result as FindByIdSuccess<T>).data.tiers);
      const newTier: TierInput = {
        tier_index:   currentTiers.length,
        min_value:    Number(input["min_value"]),
        max_value:    Number(input["max_value"]),
        level_req:    Number(input["level_req"]),
        spawn_weight: Number(input["spawn_weight"]),
      };
      const persistResult = await self.replaceTiers(parentId, [...currentTiers, newTier]);
      if (!persistResult.success) {
        return { success: false, stage: "validation", error: persistResult.error };
      }
      return { success: true, tiers: persistResult.tiers };
    },

    /**
     * Replaces the fields of a single tier by its index.
     */
    async updateTier(
      parentId: string,
      tierIndex: number,
      input: Record<string, unknown>,
    ): Promise<TierMutationResult> {
      const result = await findById(parentId);
      if (!result.success) {
        return { success: false, stage: "not_found", error: "Parent entity not found" };
      }
      const currentTiers = tierInputsFromTiers((result as FindByIdSuccess<T>).data.tiers);
      if (tierIndex < 0 || tierIndex >= currentTiers.length) {
        return { success: false, stage: "not_found", error: `Tier index ${tierIndex} not found` };
      }
      const updatedTiers = currentTiers.map((t) =>
        t.tier_index === tierIndex
          ? {
              tier_index:   tierIndex,
              min_value:    Number(input["min_value"]),
              max_value:    Number(input["max_value"]),
              level_req:    Number(input["level_req"]),
              spawn_weight: Number(input["spawn_weight"]),
            }
          : t,
      );
      const persistResult = await self.replaceTiers(parentId, updatedTiers);
      if (!persistResult.success) {
        return { success: false, stage: "validation", error: persistResult.error };
      }
      return { success: true, tiers: persistResult.tiers };
    },

    /**
     * Removes a tier by index and reindexes the remaining tiers to stay gapless.
     */
    async deleteTier(
      parentId: string,
      tierIndex: number,
    ): Promise<TierMutationResult> {
      const result = await findById(parentId);
      if (!result.success) {
        return { success: false, stage: "not_found", error: "Parent entity not found" };
      }
      const currentTiers = tierInputsFromTiers((result as FindByIdSuccess<T>).data.tiers);
      if (tierIndex < 0 || tierIndex >= currentTiers.length) {
        return { success: false, stage: "not_found", error: `Tier index ${tierIndex} not found` };
      }
      const updatedTiers = currentTiers
        .filter((t) => t.tier_index !== tierIndex)
        .map((t, i) => ({ ...t, tier_index: i }));
      const persistResult = await self.replaceTiers(parentId, updatedTiers);
      if (!persistResult.success) {
        return { success: false, stage: "validation", error: persistResult.error };
      }
      return { success: true, tiers: persistResult.tiers };
    },
  };

  return self;
}
