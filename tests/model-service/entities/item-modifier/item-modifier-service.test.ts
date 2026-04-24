// tests/model-service/entities/modifier/modifier-service.test.ts
// Integration tests for ItemModifierService — requires a running PostgreSQL database.
// Tests the full create/findById/update/delete flow including tier handling.

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { ItemModifierService } from "../../../../src/model-service/entities/item-modifier/item-modifier-service";
import { getConnection } from "../../../../src/model-service/sub-atoms/database";

// We need real parent IDs from the database. These tests create their own
// hierarchy records and clean up after themselves.

let testDomainId: string;
let testSubdomainId: string;
let testCategoryId: string;
let testSubcategoryId: string;
let testStatId: string;
let createdModifierId: string | null = null;

const TIERS_JSON_3 = JSON.stringify([
  { tier_index: 0, min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100 },
  { tier_index: 1, min_value: 3, max_value: 8, level_req: 5, spawn_weight: 80 },
  { tier_index: 2, min_value: 5, max_value: 12, level_req: 10, spawn_weight: 50 },
]);

const TIERS_JSON_1 = JSON.stringify([
  { tier_index: 0, min_value: 10, max_value: 20, level_req: 1, spawn_weight: 100 },
]);

beforeAll(async () => {
  // Create test hierarchy records
  const db = getConnection();

  const domainId = crypto.randomUUID();
  await db.unsafe(
    `INSERT INTO game_domain (id, name, description, is_active) VALUES ($1, $2, $3, $4)`,
    [domainId, "TestDomain-" + Date.now(), "test", true]
  );
  testDomainId = domainId;

  const subdomainId = crypto.randomUUID();
  await db.unsafe(
    `INSERT INTO game_subdomain (id, game_domain_id, name, description, is_active) VALUES ($1, $2, $3, $4, $5)`,
    [subdomainId, domainId, "TestSubdomain-" + Date.now(), "test", true]
  );
  testSubdomainId = subdomainId;

  const categoryId = crypto.randomUUID();
  await db.unsafe(
    `INSERT INTO game_category (id, game_domain_id, game_subdomain_id, name, description, is_active) VALUES ($1, $2, $3, $4, $5, $6)`,
    [categoryId, domainId, subdomainId, "TestCategory-" + Date.now(), "test", true]
  );
  testCategoryId = categoryId;

  const subcategoryId = crypto.randomUUID();
  await db.unsafe(
    `INSERT INTO game_subcategory (id, game_domain_id, game_subdomain_id, game_category_id, name, description, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [subcategoryId, domainId, subdomainId, categoryId, "TestSubcategory-" + Date.now(), "test", true]
  );
  testSubcategoryId = subcategoryId;

  const statRows = await db.unsafe<{ id: string }[]>(`SELECT id FROM stat LIMIT 1`);
  testStatId = statRows[0]!.id;
});

afterAll(async () => {
  // Delete in reverse hierarchy order — RESTRICT FKs prevent top-down cascade.
  // item_modifier_tier→item_modifier uses CASCADE, so deleting modifier removes its tiers.
  const db = getConnection();
  await db.unsafe(`DELETE FROM item_modifier WHERE game_subcategory_id = $1`, [testSubcategoryId]);
  await db.unsafe(`DELETE FROM game_subcategory WHERE id = $1`, [testSubcategoryId]);
  await db.unsafe(`DELETE FROM game_category WHERE id = $1`, [testCategoryId]);
  await db.unsafe(`DELETE FROM game_subdomain WHERE id = $1`, [testSubdomainId]);
  await db.unsafe(`DELETE FROM game_domain WHERE id = $1`, [testDomainId]);
});

function makeModifierInput(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    game_domain_id: testDomainId,
    game_subdomain_id: testSubdomainId,
    game_category_id: testCategoryId,
    game_subcategory_id: testSubcategoryId,
    code: "test_mod_" + Date.now(),
    name: "Test ItemModifier " + Date.now(),
    description: "A test modifier",
    affix_type: "prefix",
    target_stat_id: testStatId,
    combination_type: "flat",
    roll_shape: "scalar",
    value_min: 0,
    value_max: 100,
    modifier_group: "test_group",
    display_template: "+{value} Test Stat",
    is_active: true,
    tiers_json: TIERS_JSON_3,
    ...overrides,
  };
}

describe("ItemModifierService", () => {
  // ── Create ──────────────────────────────────────────────────────────────
  describe("create", () => {
    it("creates a modifier with 3 tiers", async () => {
      const input = makeModifierInput();
      const result = await ItemModifierService.create(input);

      expect(result.success).toBe(true);
      if (result.success) {
        createdModifierId = (result.data as { id: string }).id;
        expect(createdModifierId).toBeDefined();
      }
    });

    it("rejects creation with no tiers_json", async () => {
      const input = makeModifierInput({ tiers_json: undefined, name: "NoTiers-" + Date.now(), code: "no_tiers_" + Date.now() });
      const result = await ItemModifierService.create(input);

      expect(result.success).toBe(false);
      if (!result.success && result.stage === "validation") {
        expect(result.errors["tiers"]).toBeDefined();
      }
    });

    it("rejects creation with empty tiers array", async () => {
      const input = makeModifierInput({ tiers_json: "[]", name: "EmptyTiers-" + Date.now(), code: "empty_tiers_" + Date.now() });
      const result = await ItemModifierService.create(input);

      expect(result.success).toBe(false);
      if (!result.success && result.stage === "validation") {
        expect(result.errors["tiers"]).toContain("At least one tier");
      }
    });

    it("rejects creation with invalid tier cross-row rules", async () => {
      const badTiers = JSON.stringify([
        { tier_index: 0, min_value: 10, max_value: 20, level_req: 10, spawn_weight: 50 },
        { tier_index: 1, min_value: 5, max_value: 25, level_req: 5, spawn_weight: 100 },
      ]);
      const input = makeModifierInput({ tiers_json: badTiers, name: "BadTiers-" + Date.now(), code: "bad_tiers_" + Date.now() });
      const result = await ItemModifierService.create(input);

      expect(result.success).toBe(false);
      if (!result.success && result.stage === "validation") {
        // Should have at least level_req, min_value, or spawn_weight errors
        expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      }
    });
  });

  // ── FindById ────────────────────────────────────────────────────────────
  describe("findById", () => {
    it("returns modifier with tiers attached", async () => {
      if (!createdModifierId) throw new Error("No modifier created in prior test");

      const result = await ItemModifierService.findById(createdModifierId);
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as { tiers: readonly unknown[] };
        expect(data.tiers).toBeDefined();
        expect(data.tiers.length).toBe(3);
        // Verify tiers are sorted by tier_index
        const firstTier = data.tiers[0] as { tier_index: number; min_value: number };
        expect(firstTier.tier_index).toBe(0);
        expect(firstTier.min_value).toBe(1);
      }
    });

    it("returns empty tiers array for non-existent modifier", async () => {
      const result = await ItemModifierService.findById(crypto.randomUUID());
      expect(result.success).toBe(false);
    });
  });

  // ── Update ──────────────────────────────────────────────────────────────
  describe("update", () => {
    it("updates modifier and replaces tiers", async () => {
      if (!createdModifierId) throw new Error("No modifier created in prior test");

      // Fetch current data to build update input
      const current = await ItemModifierService.findById(createdModifierId);
      if (!current.success) throw new Error("Could not fetch modifier");

      const entity = current.data as Record<string, unknown>;
      const updateInput: Record<string, unknown> = {
        ...entity,
        name: "Updated ItemModifier " + Date.now(),
        tiers_json: TIERS_JSON_1, // Replace 3 tiers with 1 tier
      };

      const result = await ItemModifierService.update(createdModifierId, updateInput);
      expect(result.success).toBe(true);

      // Verify the new tier count
      const updated = await ItemModifierService.findById(createdModifierId);
      if (updated.success) {
        const data = updated.data as { tiers: readonly unknown[] };
        expect(data.tiers.length).toBe(1);
        const tier0 = data.tiers[0] as { min_value: number; max_value: number };
        expect(tier0.min_value).toBe(10);
        expect(tier0.max_value).toBe(20);
      }
    });
  });

  // ── Delete ──────────────────────────────────────────────────────────────
  describe("delete", () => {
    it("deletes modifier and cascades to tiers", async () => {
      if (!createdModifierId) throw new Error("No modifier created in prior test");

      const result = await ItemModifierService.delete(createdModifierId);
      expect(result.success).toBe(true);

      // Verify tiers are also gone
      const db = getConnection();
      const rows = await db.unsafe(
        `SELECT id FROM item_modifier_tier WHERE modifier_id = $1`,
        [createdModifierId]
      );
      expect(rows.length).toBe(0);

      createdModifierId = null;
    });
  });

  // ── addTier ─────────────────────────────────────────────────────────────
  describe("addTier", () => {
    let modifierIdForTierTests: string | null = null;

    it("setup: create a modifier with 2 tiers for addTier/updateTier/deleteTier tests", async () => {
      const twoTiers = JSON.stringify([
        { tier_index: 0, min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100 },
        { tier_index: 1, min_value: 3, max_value: 8, level_req: 5, spawn_weight: 80 },
      ]);
      const input = makeModifierInput({
        name: "TierOps-" + Date.now(),
        code: "tier_ops_" + Date.now(),
        tiers_json: twoTiers,
      });
      const result = await ItemModifierService.create(input);
      expect(result.success).toBe(true);
      if (result.success) {
        modifierIdForTierTests = (result.data as { id: string }).id;
      }
    });

    it("appends a tier with auto-assigned tier_index = currentTiers.length", async () => {
      if (!modifierIdForTierTests) throw new Error("Setup modifier not created");

      // Current tier count is 2 (indexes 0 and 1) → new tier should get index 2
      const result = await ItemModifierService.addTier(modifierIdForTierTests, {
        min_value: 6,
        max_value: 15,
        level_req: 10,
        spawn_weight: 50,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.tiers).toHaveLength(3);
        const newTier = result.tiers.find((t) => t.tier_index === 2);
        expect(newTier).toBeDefined();
        expect(newTier!.min_value).toBe(6);
        expect(newTier!.level_req).toBe(10);
      }
    });

    it("returns not_found for a non-existent parent id", async () => {
      const result = await ItemModifierService.addTier(crypto.randomUUID(), {
        min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });

    // ── updateTier ─────────────────────────────────────────────────────────

    it("replaces a tier's values at the given index", async () => {
      if (!modifierIdForTierTests) throw new Error("Setup modifier not created");

      // Modifier now has 3 tiers [0, 1, 2]:
      //   tier 0: min_value=1, max_value=5,  level_req=1,  spawn_weight=100
      //   tier 1: min_value=3, max_value=8,  level_req=5,  spawn_weight=80
      //   tier 2: min_value=6, max_value=15, level_req=10, spawn_weight=50
      //
      // Update tier 0 — values must satisfy progression rules against tier 1:
      //   min_value 1 ≤ tier1.min_value 3 ✓   spawn_weight 100 ≥ tier1.spawn_weight 80 ✓
      const result = await ItemModifierService.updateTier(modifierIdForTierTests, 0, {
        min_value: 1,
        max_value: 7,   // changed from 5 — distinct value to confirm update took effect
        level_req: 1,
        spawn_weight: 100,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const tier0 = result.tiers.find((t) => t.tier_index === 0);
        expect(tier0).toBeDefined();
        expect(tier0!.min_value).toBe(1);
        expect(tier0!.max_value).toBe(7); // confirms the update was persisted
      }
    });

    it("updateTier returns not_found for a non-existent parent id", async () => {
      const result = await ItemModifierService.updateTier(crypto.randomUUID(), 0, {
        min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });

    it("updateTier returns not_found for an out-of-bounds tier index", async () => {
      if (!modifierIdForTierTests) throw new Error("Setup modifier not created");

      const result = await ItemModifierService.updateTier(modifierIdForTierTests, 999, {
        min_value: 1, max_value: 5, level_req: 1, spawn_weight: 100,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });

    // ── deleteTier — reindexing is the critical case ────────────────────────

    it("removes a middle tier and reindexes remaining tiers gaplessly", async () => {
      if (!modifierIdForTierTests) throw new Error("Setup modifier not created");

      // Modifier has 3 tiers [0, 1, 2]. Delete index 1 → expect [0, 1] (NOT [0, 2]).
      const result = await ItemModifierService.deleteTier(modifierIdForTierTests, 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.tiers).toHaveLength(2);

        const indexes = result.tiers.map((t) => t.tier_index).sort((a, b) => a - b);
        // Must be gapless [0, 1], NOT [0, 2]
        expect(indexes).toEqual([0, 1]);
      }
    });

    it("deleteTier returns not_found for a non-existent parent id", async () => {
      const result = await ItemModifierService.deleteTier(crypto.randomUUID(), 0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });

    it("deleteTier returns not_found for an out-of-bounds tier index", async () => {
      if (!modifierIdForTierTests) throw new Error("Setup modifier not created");

      const result = await ItemModifierService.deleteTier(modifierIdForTierTests, 999);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.stage).toBe("not_found");
      }
    });

    it("cleanup: delete the tier-ops modifier", async () => {
      if (!modifierIdForTierTests) return;
      await ItemModifierService.delete(modifierIdForTierTests);
      modifierIdForTierTests = null;
    });
  });
});
