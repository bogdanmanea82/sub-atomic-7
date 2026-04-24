// tests/model/entities/stat/stat-model.test.ts
// Verifies StatModel correctly pre-binds STAT_CONFIG to all universal operations.
// Pure unit tests — no database.

import { describe, it, expect } from "bun:test";
import { StatModel } from "../../../../src/model/entities/stat/stat-model";

const VALID_INPUT: Record<string, unknown> = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  machine_name: "strength",
  name: "Strength",
  description: "Raw physical power that scales life and melee damage.",
  data_type: "raw",
  value_min: 0,
  value_max: 9999,
  default_value: 10,
  category: "attribute",
};

describe("StatModel", () => {
  // ── Validation ─────────────────────────────────────────────────────────
  describe("validate", () => {
    it("accepts a fully valid stat input", () => {
      const result = StatModel.validate(VALID_INPUT);
      expect(result["machine_name"]).toBe("strength");
      expect(result["name"]).toBe("Strength");
      expect(result["data_type"]).toBe("raw");
      expect(result["category"]).toBe("attribute");
    });

    it("accepts null description (optional field)", () => {
      expect(() =>
        StatModel.validate({ ...VALID_INPUT, description: null })
      ).not.toThrow();
    });

    it("accepts all valid data_type values", () => {
      for (const dt of ["raw", "percentage", "multiplier"]) {
        expect(() =>
          StatModel.validate({ ...VALID_INPUT, data_type: dt })
        ).not.toThrow();
      }
    });

    it("accepts all valid category values", () => {
      for (const cat of ["attribute", "resource", "offensive", "defensive", "utility"]) {
        expect(() =>
          StatModel.validate({ ...VALID_INPUT, category: cat })
        ).not.toThrow();
      }
    });

    it("accepts negative value_min (resistances can reach -100)", () => {
      expect(() =>
        StatModel.validate({ ...VALID_INPUT, value_min: -100 })
      ).not.toThrow();
    });

    it("rejects missing machine_name", () => {
      try {
        StatModel.validate({ ...VALID_INPUT, machine_name: undefined });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["machine_name"]).toBeDefined();
      }
    });

    it("rejects missing name", () => {
      try {
        StatModel.validate({ ...VALID_INPUT, name: undefined });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["name"]).toBeDefined();
      }
    });

    it("rejects invalid data_type enum value", () => {
      try {
        StatModel.validate({ ...VALID_INPUT, data_type: "absolute" });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["data_type"]).toBeDefined();
      }
    });

    it("rejects invalid category enum value", () => {
      try {
        StatModel.validate({ ...VALID_INPUT, category: "combat" });
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["category"]).toBeDefined();
      }
    });

    it("rejects completely empty input with multiple errors", () => {
      try {
        StatModel.validate({});
        expect(true).toBe(false);
      } catch (error) {
        const err = error as Error & { errors: Record<string, string> };
        expect(err.errors["machine_name"]).toBeDefined();
        expect(err.errors["name"]).toBeDefined();
        expect(err.errors["data_type"]).toBeDefined();
        expect(err.errors["category"]).toBeDefined();
      }
    });
  });

  // ── Serialization ──────────────────────────────────────────────────────
  describe("serialize (create)", () => {
    it("passes integer fields through unchanged", () => {
      const result = StatModel.serialize(VALID_INPUT, "create");
      expect(result["value_min"]).toBe(0);
      expect(result["value_max"]).toBe(9999);
      expect(result["default_value"]).toBe(10);
    });

    it("passes string fields through", () => {
      const result = StatModel.serialize(VALID_INPUT, "create");
      expect(result["machine_name"]).toBe("strength");
      expect(result["data_type"]).toBe("raw");
      expect(result["category"]).toBe("attribute");
    });

    it("produces ISO string timestamps for created_at and updated_at", () => {
      const result = StatModel.serialize(VALID_INPUT, "create");
      expect(typeof result["created_at"]).toBe("string");
      expect(typeof result["updated_at"]).toBe("string");
      expect(result["created_at"] as string).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("serializes null description as null", () => {
      const result = StatModel.serialize({ ...VALID_INPUT, description: null }, "create");
      expect(result["description"]).toBeNull();
    });
  });

  describe("serialize (update)", () => {
    it("includes updated_at but NOT created_at", () => {
      const result = StatModel.serialize(VALID_INPUT, "update");
      expect(result["updated_at"]).toBeDefined();
      expect(result["created_at"]).toBeUndefined();
    });
  });

  // ── Deserialization ────────────────────────────────────────────────────
  describe("deserialize", () => {
    it("returns typed Stat with correct field values", () => {
      const dbRow: Record<string, unknown> = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        machine_name: "strength",
        name: "Strength",
        description: null,
        data_type: "raw",
        value_min: 0,
        value_max: 9999,
        default_value: 10,
        category: "attribute",
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-01"),
      };
      const stat = StatModel.deserialize(dbRow);
      expect(stat.machine_name).toBe("strength");
      expect(stat.value_min).toBe(0);
      expect(stat.default_value).toBe(10);
      expect(stat.description).toBeNull();
    });
  });

  // ── Query building ─────────────────────────────────────────────────────
  describe("prepareCreate", () => {
    it("produces INSERT INTO stat SQL", () => {
      const query = StatModel.prepareCreate(VALID_INPUT);
      expect(query.sql).toContain("INSERT INTO");
      expect(query.sql).toContain("stat");
    });

    it("placeholder count matches param count", () => {
      const query = StatModel.prepareCreate(VALID_INPUT);
      const placeholders = (query.sql.match(/\?/g) ?? []).length;
      expect(placeholders).toBe(query.params.length);
    });

    it("params include the machine_name value", () => {
      const query = StatModel.prepareCreate(VALID_INPUT);
      expect(query.params).toContain("strength");
    });
  });

  describe("prepareSelect", () => {
    it("produces SELECT FROM stat SQL", () => {
      const query = StatModel.prepareSelect();
      expect(query.sql).toContain("SELECT");
      expect(query.sql).toContain("stat");
    });

    it("includes condition value in params when conditions provided", () => {
      const query = StatModel.prepareSelect({ machine_name: "strength" });
      expect(query.params).toContain("strength");
    });
  });

  describe("prepareUpdate", () => {
    it("produces UPDATE stat SET SQL", () => {
      const query = StatModel.prepareUpdate(
        { name: "Updated Strength" },
        { id: "550e8400-e29b-41d4-a716-446655440000" },
      );
      expect(query.sql).toContain("UPDATE");
      expect(query.sql).toContain("stat");
      expect(query.sql).toContain("SET");
    });
  });

  describe("prepareDelete", () => {
    it("produces DELETE FROM stat SQL", () => {
      const query = StatModel.prepareDelete({ id: "some-uuid" });
      expect(query.sql).toContain("DELETE FROM");
      expect(query.sql).toContain("stat");
      expect(query.params).toContain("some-uuid");
    });
  });
});
