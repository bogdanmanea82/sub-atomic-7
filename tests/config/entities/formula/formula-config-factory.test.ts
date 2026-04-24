// tests/config/entities/formula/formula-config-factory.test.ts
// Verifies FORMULA_CONFIG is assembled correctly from Layer 0 building blocks.
// Pure unit tests — no database.

import { describe, it, expect } from "bun:test";
import { FORMULA_CONFIG } from "../../../../src/config/entities/formula";

describe("FORMULA_CONFIG", () => {
  // ── Identity ───────────────────────────────────────────────────────────

  it("has entity name 'Formula'", () => {
    expect(FORMULA_CONFIG.name).toBe("Formula");
  });

  it("has tableName 'formula'", () => {
    expect(FORMULA_CONFIG.tableName).toBe("formula");
  });

  it("has correct display names", () => {
    expect(FORMULA_CONFIG.displayName).toBe("Formula");
    expect(FORMULA_CONFIG.pluralDisplayName).toBe("Formulas");
  });

  // ── Field count ────────────────────────────────────────────────────────

  it("has exactly 7 fields (id + name + output_stat_id + expression + description + audit×2)", () => {
    expect(FORMULA_CONFIG.fields).toHaveLength(7);
  });

  // ── Field order and names ──────────────────────────────────────────────

  it("has fields in correct order", () => {
    const names = FORMULA_CONFIG.fields.map((f) => f.name);
    expect(names).toEqual([
      "id",
      "name",
      "output_stat_id",
      "expression",
      "description",
      "created_at",
      "updated_at",
    ]);
  });

  // ── output_stat_id field ───────────────────────────────────────────────

  it("output_stat_id is a required reference to the Stat entity", () => {
    const f = FORMULA_CONFIG.fields.find((f) => f.name === "output_stat_id");
    expect(f).toBeDefined();
    expect(f!.type).toBe("reference");
    expect(f!.required).toBe(true);
    if (f!.type === "reference") {
      expect(f!.targetEntity).toBe("Stat");
      expect(f!.targetTable).toBe("stat");
      expect(f!.targetDisplayField).toBe("name");
    }
  });

  it("output_stat_id uses select display format", () => {
    const f = FORMULA_CONFIG.fields.find((f) => f.name === "output_stat_id");
    expect(f!.displayFormat).toBe("select");
  });

  // ── expression field ───────────────────────────────────────────────────

  it("expression is a required string with 1–500 length", () => {
    const f = FORMULA_CONFIG.fields.find((f) => f.name === "expression");
    expect(f).toBeDefined();
    expect(f!.type).toBe("string");
    expect(f!.required).toBe(true);
    if (f!.type === "string") {
      expect(f!.minLength).toBe(1);
      expect(f!.maxLength).toBe(500);
    }
  });

  it("expression uses textarea display format", () => {
    const f = FORMULA_CONFIG.fields.find((f) => f.name === "expression");
    expect(f!.displayFormat).toBe("textarea");
  });

  // ── description field ──────────────────────────────────────────────────

  it("description is optional", () => {
    const f = FORMULA_CONFIG.fields.find((f) => f.name === "description");
    expect(f).toBeDefined();
    expect(f!.required).toBe(false);
  });

  // ── Timestamp fields ───────────────────────────────────────────────────

  it("created_at is auto-set on create", () => {
    const f = FORMULA_CONFIG.fields.find((f) => f.name === "created_at");
    expect(f!.type).toBe("timestamp");
    if (f!.type === "timestamp") {
      expect(f!.autoSet).toBe("create");
    }
  });

  it("updated_at is auto-set on update", () => {
    const f = FORMULA_CONFIG.fields.find((f) => f.name === "updated_at");
    expect(f!.type).toBe("timestamp");
    if (f!.type === "timestamp") {
      expect(f!.autoSet).toBe("update");
    }
  });

  // ── Permissions ────────────────────────────────────────────────────────

  it("read is public, write operations require admin", () => {
    expect(FORMULA_CONFIG.permissions.read).toBe("public");
    expect(FORMULA_CONFIG.permissions.create).toBe("admin");
    expect(FORMULA_CONFIG.permissions.update).toBe("admin");
    expect(FORMULA_CONFIG.permissions.delete).toBe("admin");
  });
});
