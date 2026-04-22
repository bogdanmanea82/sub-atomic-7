// tests/model-service/sub-atoms/tiers/create-tier-orchestration.test.ts
// Tests the error-path returns in createTierOrchestration — every code path that
// returns BEFORE self.replaceTiers() is called touches no database.
//
// Success paths (reindexing after deleteTier, etc.) are tested via the integration
// tests in item-modifier-service.test.ts which have a live PostgreSQL connection.

import { describe, it, expect } from "bun:test";
import {
  createTierOrchestration,
  type TierOrchestrationModel,
  type HasTiers,
} from "../../../../src/model-service/sub-atoms/tiers/create-tier-orchestration";
import type { TierInput } from "../../../../src/model-service/atoms/validation/validate-tier-set";

// ── Test helpers ───────────────────────────────────────────────────────────────

/** Creates a valid TierInput with required fields. */
const tier = (overrides: Partial<TierInput> & { tier_index: number }): TierInput => ({
  min_value: 1,
  max_value: 5,
  level_req: 1,
  spawn_weight: 100,
  ...overrides,
});

/** A mock findById that always returns success with the given tiers array. */
function mockFoundWith(tiers: TierInput[]) {
  return async (_id: string) => ({
    success: true as const,
    data: { tiers } as HasTiers,
  });
}

/** A mock findById that always returns not_found. */
const mockNotFound = async (_id: string) => ({
  success: false as const,
  stage: "not_found" as const,
  error: "not found",
});

/**
 * A tier model stub whose methods should never be called in error-path tests.
 * If they are called, the test will throw — surfacing a logic bug.
 */
const neverCalledTierModel: TierOrchestrationModel = {
  prepareCreate: () => { throw new Error("prepareCreate should not be called in error paths"); },
  prepareDelete: () => { throw new Error("prepareDelete should not be called in error paths"); },
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("createTierOrchestration", () => {
  const parentId = "test-parent-id";

  // ── deleteTier error paths ───────────────────────────────────────────────────

  describe("deleteTier", () => {
    it("returns not_found when findById returns success=false", async () => {
      const { deleteTier } = createTierOrchestration(neverCalledTierModel, mockNotFound);
      const result = await deleteTier(parentId, 0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
        expect(result.error).toContain("Parent entity not found");
      }
    });

    it("returns not_found when tierIndex is negative", async () => {
      // Empty tiers array — any non-negative index would be out of bounds too,
      // but negative is the most explicit boundary.
      const { deleteTier } = createTierOrchestration(
        neverCalledTierModel,
        mockFoundWith([tier({ tier_index: 0 })]),
      );
      const result = await deleteTier(parentId, -1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });

    it("returns not_found when tierIndex equals tiers.length (off-by-one boundary)", async () => {
      // 1 tier at index 0 → valid indexes are {0} → index 1 is out of bounds
      const { deleteTier } = createTierOrchestration(
        neverCalledTierModel,
        mockFoundWith([tier({ tier_index: 0 })]),
      );
      const result = await deleteTier(parentId, 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
        expect(result.error).toContain("Tier index 1 not found");
      }
    });

    it("returns not_found when tierIndex is beyond tiers.length", async () => {
      const { deleteTier } = createTierOrchestration(
        neverCalledTierModel,
        mockFoundWith([tier({ tier_index: 0 }), tier({ tier_index: 1 })]),
      );
      const result = await deleteTier(parentId, 99);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });
  });

  // ── updateTier error paths ───────────────────────────────────────────────────

  describe("updateTier", () => {
    it("returns not_found when findById returns success=false", async () => {
      const { updateTier } = createTierOrchestration(neverCalledTierModel, mockNotFound);
      const result = await updateTier(parentId, 0, { min_value: 5, max_value: 10, level_req: 1, spawn_weight: 80 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
        expect(result.error).toContain("Parent entity not found");
      }
    });

    it("returns not_found when tierIndex is out of bounds", async () => {
      const { updateTier } = createTierOrchestration(
        neverCalledTierModel,
        mockFoundWith([tier({ tier_index: 0 })]),
      );
      const result = await updateTier(parentId, 5, { min_value: 5, max_value: 10, level_req: 1, spawn_weight: 80 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
        expect(result.error).toContain("Tier index 5 not found");
      }
    });
  });

  // ── addTier error paths ──────────────────────────────────────────────────────

  describe("addTier", () => {
    it("returns not_found when findById returns success=false", async () => {
      const { addTier } = createTierOrchestration(neverCalledTierModel, mockNotFound);
      const result = await addTier(parentId, { min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
        expect(result.error).toContain("Parent entity not found");
      }
    });
  });

  // ── replaceTiers — validation-only path (no DB) ──────────────────────────────

  describe("replaceTiers (validation only)", () => {
    it("returns success=false when a non-empty tier set fails validateTierSet", async () => {
      const { replaceTiers } = createTierOrchestration(neverCalledTierModel, mockNotFound);

      // Tier at index 2 but only one tier → gap in indexes (should start at 0,1,2... gaplessly)
      const invalidTiers: TierInput[] = [
        tier({ tier_index: 0 }),
        tier({ tier_index: 2 }), // gap: index 1 is missing
      ];
      const result = await replaceTiers(parentId, invalidTiers);

      expect(result.success).toBe(false);
      if (!result.success) {
        // The error string is the concatenation of all validation error messages
        expect(result.error.length).toBeGreaterThan(0);
      }
    });
  });
});
