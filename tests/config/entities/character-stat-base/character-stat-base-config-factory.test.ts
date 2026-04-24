// tests/config/entities/character-stat-base/character-stat-base-config-factory.test.ts
// Verifies CHARACTER_STAT_BASE_CONFIG is assembled correctly.
// This is a junction entity: two hidden FK reference fields + one value column.
// Pure unit tests — no database.

import { describe, it, expect } from "bun:test";
import { CHARACTER_STAT_BASE_CONFIG } from "../../../../src/config/entities/character-stat-base";

describe("CHARACTER_STAT_BASE_CONFIG", () => {
  // ── Identity ───────────────────────────────────────────────────────────

  it("has entity name 'CharacterStatBase'", () => {
    expect(CHARACTER_STAT_BASE_CONFIG.name).toBe("CharacterStatBase");
  });

  it("has tableName 'character_stat_base'", () => {
    expect(CHARACTER_STAT_BASE_CONFIG.tableName).toBe("character_stat_base");
  });

  it("has correct display names", () => {
    expect(CHARACTER_STAT_BASE_CONFIG.displayName).toBe("Character Stat Base");
    expect(CHARACTER_STAT_BASE_CONFIG.pluralDisplayName).toBe("Character Stat Bases");
  });

  // ── Field count ────────────────────────────────────────────────────────

  it("has exactly 6 fields (id + character_id + stat_id + base_value + audit×2)", () => {
    expect(CHARACTER_STAT_BASE_CONFIG.fields).toHaveLength(6);
  });

  // ── Field order and names ──────────────────────────────────────────────

  it("has fields in correct order", () => {
    const names = CHARACTER_STAT_BASE_CONFIG.fields.map((f) => f.name);
    expect(names).toEqual([
      "id",
      "character_id",
      "stat_id",
      "base_value",
      "created_at",
      "updated_at",
    ]);
  });

  // ── character_id field ─────────────────────────────────────────────────

  it("character_id is a required reference to the Character entity", () => {
    const f = CHARACTER_STAT_BASE_CONFIG.fields.find((f) => f.name === "character_id");
    expect(f).toBeDefined();
    expect(f!.type).toBe("reference");
    expect(f!.required).toBe(true);
    if (f!.type === "reference") {
      expect(f!.targetEntity).toBe("Character");
      expect(f!.targetTable).toBe("character");
    }
  });

  it("character_id has hidden display format (FK not shown in forms)", () => {
    const f = CHARACTER_STAT_BASE_CONFIG.fields.find((f) => f.name === "character_id");
    expect(f!.displayFormat).toBe("hidden");
  });

  // ── stat_id field ──────────────────────────────────────────────────────

  it("stat_id is a required reference to the Stat entity", () => {
    const f = CHARACTER_STAT_BASE_CONFIG.fields.find((f) => f.name === "stat_id");
    expect(f).toBeDefined();
    expect(f!.type).toBe("reference");
    expect(f!.required).toBe(true);
    if (f!.type === "reference") {
      expect(f!.targetEntity).toBe("Stat");
      expect(f!.targetTable).toBe("stat");
    }
  });

  it("stat_id has hidden display format", () => {
    const f = CHARACTER_STAT_BASE_CONFIG.fields.find((f) => f.name === "stat_id");
    expect(f!.displayFormat).toBe("hidden");
  });

  // ── base_value field ───────────────────────────────────────────────────

  it("base_value is a required integer with full signed range", () => {
    const f = CHARACTER_STAT_BASE_CONFIG.fields.find((f) => f.name === "base_value");
    expect(f).toBeDefined();
    expect(f!.type).toBe("integer");
    expect(f!.required).toBe(true);
    if (f!.type === "integer") {
      expect(f!.min).toBe(-2147483648);
      expect(f!.max).toBe(2147483647);
    }
  });

  // ── Permissions ────────────────────────────────────────────────────────

  it("read is public, write operations require admin", () => {
    expect(CHARACTER_STAT_BASE_CONFIG.permissions.read).toBe("public");
    expect(CHARACTER_STAT_BASE_CONFIG.permissions.create).toBe("admin");
    expect(CHARACTER_STAT_BASE_CONFIG.permissions.update).toBe("admin");
    expect(CHARACTER_STAT_BASE_CONFIG.permissions.delete).toBe("admin");
  });
});
