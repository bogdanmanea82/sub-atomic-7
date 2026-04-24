// tests/config/entities/stat/stat-config-factory.test.ts
// Verifies STAT_CONFIG is assembled correctly from Layer 0 building blocks.
// Pure unit tests — no database.

import { describe, it, expect } from "bun:test";
import { STAT_CONFIG } from "../../../../src/config/entities/stat";

describe("STAT_CONFIG", () => {
  // ── Identity ───────────────────────────────────────────────────────────

  it("has entity name 'Stat'", () => {
    expect(STAT_CONFIG.name).toBe("Stat");
  });

  it("has tableName 'stat' (snake_case of Stat)", () => {
    expect(STAT_CONFIG.tableName).toBe("stat");
  });

  it("has correct display names", () => {
    expect(STAT_CONFIG.displayName).toBe("Stat");
    expect(STAT_CONFIG.pluralDisplayName).toBe("Stats");
  });

  // ── Field count ────────────────────────────────────────────────────────

  it("has exactly 11 fields (id + machine_name + name + description + data_type + value_min + value_max + default_value + category + audit×2)", () => {
    expect(STAT_CONFIG.fields).toHaveLength(11);
  });

  // ── Field order and names ──────────────────────────────────────────────

  it("has fields in correct order", () => {
    const names = STAT_CONFIG.fields.map((f) => f.name);
    expect(names).toEqual([
      "id",
      "machine_name",
      "name",
      "description",
      "data_type",
      "value_min",
      "value_max",
      "default_value",
      "category",
      "created_at",
      "updated_at",
    ]);
  });

  // ── machine_name field ─────────────────────────────────────────────────

  it("machine_name is a required string with 3–50 length and snake_case pattern", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "machine_name");
    expect(f).toBeDefined();
    expect(f!.type).toBe("string");
    expect(f!.required).toBe(true);
    if (f!.type === "string") {
      expect(f!.minLength).toBe(3);
      expect(f!.maxLength).toBe(50);
      expect(f!.pattern).toBe("^[a-z][a-z0-9_]*$");
    }
  });

  // ── data_type field ────────────────────────────────────────────────────

  it("data_type is a required enum with values raw, percentage, multiplier", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "data_type");
    expect(f).toBeDefined();
    expect(f!.type).toBe("enum");
    expect(f!.required).toBe(true);
    if (f!.type === "enum") {
      expect(f!.values).toContain("raw");
      expect(f!.values).toContain("percentage");
      expect(f!.values).toContain("multiplier");
      expect(f!.values).toHaveLength(3);
    }
  });

  // ── value_min field ────────────────────────────────────────────────────

  it("value_min is a required integer with signed range (allows negatives for resistances)", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "value_min");
    expect(f).toBeDefined();
    expect(f!.type).toBe("integer");
    expect(f!.required).toBe(true);
    if (f!.type === "integer") {
      expect(f!.min).toBe(-2147483648);
      expect(f!.max).toBe(2147483647);
    }
  });

  // ── value_max field ────────────────────────────────────────────────────

  it("value_max is a required integer with signed range", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "value_max");
    expect(f).toBeDefined();
    expect(f!.type).toBe("integer");
    expect(f!.required).toBe(true);
    if (f!.type === "integer") {
      expect(f!.min).toBe(-2147483648);
      expect(f!.max).toBe(2147483647);
    }
  });

  // ── default_value field ────────────────────────────────────────────────

  it("default_value is a required integer with standard (non-negative) range", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "default_value");
    expect(f).toBeDefined();
    expect(f!.type).toBe("integer");
    expect(f!.required).toBe(true);
    if (f!.type === "integer") {
      expect(f!.min).toBe(0);
      expect(f!.max).toBe(2147483647);
    }
  });

  // ── category field ─────────────────────────────────────────────────────

  it("category is a required enum with all 5 semantic groupings", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "category");
    expect(f).toBeDefined();
    expect(f!.type).toBe("enum");
    expect(f!.required).toBe(true);
    if (f!.type === "enum") {
      expect(f!.values).toContain("attribute");
      expect(f!.values).toContain("resource");
      expect(f!.values).toContain("offensive");
      expect(f!.values).toContain("defensive");
      expect(f!.values).toContain("utility");
      expect(f!.values).toHaveLength(5);
    }
  });

  // ── Timestamp fields ───────────────────────────────────────────────────

  it("created_at is auto-set on create", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "created_at");
    expect(f).toBeDefined();
    expect(f!.type).toBe("timestamp");
    if (f!.type === "timestamp") {
      expect(f!.autoSet).toBe("create");
    }
  });

  it("updated_at is auto-set on update", () => {
    const f = STAT_CONFIG.fields.find((f) => f.name === "updated_at");
    expect(f).toBeDefined();
    expect(f!.type).toBe("timestamp");
    if (f!.type === "timestamp") {
      expect(f!.autoSet).toBe("update");
    }
  });

  // ── Permissions ────────────────────────────────────────────────────────

  it("read is public, write operations require admin", () => {
    expect(STAT_CONFIG.permissions.read).toBe("public");
    expect(STAT_CONFIG.permissions.create).toBe("admin");
    expect(STAT_CONFIG.permissions.update).toBe("admin");
    expect(STAT_CONFIG.permissions.delete).toBe("admin");
  });
});
