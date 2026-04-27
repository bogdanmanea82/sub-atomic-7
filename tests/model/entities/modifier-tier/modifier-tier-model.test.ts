// tests/model/entities/modifier-tier/modifier-tier-model.test.ts
import { describe, it, expect } from "bun:test";
import { ModifierTierModel } from "@model/entities/modifier-tier";

const VALID_TIER_INPUT: Record<string, unknown> = {
  modifier_id: "550e8400-e29b-41d4-a716-446655440000",
  tier_index: 0,
  min_value: 1.5,
  max_value: 5.0,
  level_req: 1,
  spawn_weight: 100,
};

describe("ModifierTierModel", () => {
  // ── Validation ──────────────────────────────────────────────────────────
  describe("validate", () => {
    it("accepts valid tier input", () => {
      const result = ModifierTierModel.validate(VALID_TIER_INPUT);
      expect(result["tier_index"]).toBe(0);
      expect(result["min_value"]).toBe(1.5);
      expect(result["max_value"]).toBe(5.0);
      expect(result["level_req"]).toBe(1);
      expect(result["spawn_weight"]).toBe(100);
    });

    it("accepts tier_index 0 (first tier)", () => {
      expect(() => ModifierTierModel.validate({ ...VALID_TIER_INPUT, tier_index: 0 })).not.toThrow();
    });

    it("rejects negative tier_index", () => {
      try {
        ModifierTierModel.validate({ ...VALID_TIER_INPUT, tier_index: -1 });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["tier_index"]).toBeDefined();
      }
    });

    it("rejects level_req below 1", () => {
      try {
        ModifierTierModel.validate({ ...VALID_TIER_INPUT, level_req: 0 });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["level_req"]).toBeDefined();
      }
    });

    it("rejects level_req above 99", () => {
      try {
        ModifierTierModel.validate({ ...VALID_TIER_INPUT, level_req: 100 });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["level_req"]).toBeDefined();
      }
    });

    it("rejects negative spawn_weight", () => {
      try {
        ModifierTierModel.validate({ ...VALID_TIER_INPUT, spawn_weight: -1 });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["spawn_weight"]).toBeDefined();
      }
    });

    it("rejects missing required fields", () => {
      try {
        ModifierTierModel.validate({});
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["modifier_id"]).toBeDefined();
        expect(err.errors["tier_index"]).toBeDefined();
        expect(err.errors["min_value"]).toBeDefined();
        expect(err.errors["max_value"]).toBeDefined();
      }
    });

    it("rejects NaN for decimal fields", () => {
      try {
        ModifierTierModel.validate({ ...VALID_TIER_INPUT, min_value: NaN });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["min_value"]).toContain("valid number");
      }
    });
  });

  // ── Serialization ───────────────────────────────────────────────────────
  describe("serialize", () => {
    it("serializes decimal values to strings for NUMERIC columns", () => {
      const result = ModifierTierModel.serialize(VALID_TIER_INPUT, "create");
      expect(result["min_value"]).toBe("1.5");
      expect(result["max_value"]).toBe("5");
    });

    it("passes through integer values", () => {
      const result = ModifierTierModel.serialize(VALID_TIER_INPUT, "create");
      expect(result["tier_index"]).toBe(0);
      expect(result["level_req"]).toBe(1);
      expect(result["spawn_weight"]).toBe(100);
    });

    it("sets auto timestamps on create", () => {
      const result = ModifierTierModel.serialize(VALID_TIER_INPUT, "create");
      expect(result["created_at"]).toBeDefined();
      expect(result["updated_at"]).toBeDefined();
    });
  });

  // ── Deserialization ─────────────────────────────────────────────────────
  describe("deserialize", () => {
    it("parses NUMERIC string columns back to numbers", () => {
      const dbRow: Record<string, unknown> = {
        id: "some-uuid",
        modifier_id: "mod-uuid",
        tier_index: 0,
        min_value: "1.5000",
        max_value: "5.0000",
        level_req: 1,
        spawn_weight: 100,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const result = ModifierTierModel.deserialize(dbRow);
      expect(result.min_value).toBe(1.5);
      expect(result.max_value).toBe(5);
      expect(result.tier_index).toBe(0);
    });
  });

  // ── Query building ──────────────────────────────────────────────────────
  describe("prepareCreate", () => {
    it("builds an INSERT query with correct table", () => {
      const input = { ...VALID_TIER_INPUT, id: "test-uuid" };
      const query = ModifierTierModel.prepareCreate(input);
      expect(query.sql).toContain("INSERT INTO");
      expect(query.sql).toContain("modifier_tier");
    });
  });

  describe("prepareSelect", () => {
    it("builds a SELECT query for modifier_id condition", () => {
      const query = ModifierTierModel.prepareSelect({ modifier_id: "some-uuid" });
      expect(query.sql).toContain("SELECT");
      expect(query.sql).toContain("modifier_tier");
      expect(query.params).toContain("some-uuid");
    });
  });

  describe("prepareDelete", () => {
    it("builds a DELETE query for modifier_id condition", () => {
      const query = ModifierTierModel.prepareDelete({ modifier_id: "some-uuid" });
      expect(query.sql).toContain("DELETE FROM");
      expect(query.sql).toContain("modifier_tier");
      expect(query.params).toContain("some-uuid");
    });
  });
});
