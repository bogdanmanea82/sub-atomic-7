// tests/config/entities/character/character-config-factory.test.ts
// Verifies CHARACTER_CONFIG is assembled correctly from Layer 0 building blocks.
// Pure unit tests — no database.

import { describe, it, expect } from "bun:test";
import { CHARACTER_CONFIG } from "../../../../src/config/entities/character";

describe("CHARACTER_CONFIG", () => {
  // ── Identity ───────────────────────────────────────────────────────────

  it("has entity name 'Character'", () => {
    expect(CHARACTER_CONFIG.name).toBe("Character");
  });

  it("has tableName 'character'", () => {
    expect(CHARACTER_CONFIG.tableName).toBe("character");
  });

  it("has correct display names", () => {
    expect(CHARACTER_CONFIG.displayName).toBe("Character");
    expect(CHARACTER_CONFIG.pluralDisplayName).toBe("Characters");
  });

  // ── Field count ────────────────────────────────────────────────────────

  it("has exactly 7 fields (id + machine_name + name + description + is_active + audit×2)", () => {
    expect(CHARACTER_CONFIG.fields).toHaveLength(7);
  });

  // ── Field order and names ──────────────────────────────────────────────

  it("has fields in correct order", () => {
    const names = CHARACTER_CONFIG.fields.map((f) => f.name);
    expect(names).toEqual([
      "id",
      "machine_name",
      "name",
      "description",
      "is_active",
      "created_at",
      "updated_at",
    ]);
  });

  // ── machine_name field ─────────────────────────────────────────────────

  it("machine_name is a required string with snake_case pattern", () => {
    const f = CHARACTER_CONFIG.fields.find((f) => f.name === "machine_name");
    expect(f).toBeDefined();
    expect(f!.type).toBe("string");
    expect(f!.required).toBe(true);
    if (f!.type === "string") {
      expect(f!.pattern).toBe("^[a-z][a-z0-9_]*$");
    }
  });

  // ── is_active field ────────────────────────────────────────────────────

  it("is_active is a required boolean with default true", () => {
    const f = CHARACTER_CONFIG.fields.find((f) => f.name === "is_active");
    expect(f).toBeDefined();
    expect(f!.type).toBe("boolean");
    expect(f!.required).toBe(true);
    if (f!.type === "boolean") {
      expect(f!.defaultValue).toBe(true);
    }
  });

  // ── Timestamp fields ───────────────────────────────────────────────────

  it("created_at is auto-set on create", () => {
    const f = CHARACTER_CONFIG.fields.find((f) => f.name === "created_at");
    expect(f!.type).toBe("timestamp");
    if (f!.type === "timestamp") {
      expect(f!.autoSet).toBe("create");
    }
  });

  it("updated_at is auto-set on update", () => {
    const f = CHARACTER_CONFIG.fields.find((f) => f.name === "updated_at");
    expect(f!.type).toBe("timestamp");
    if (f!.type === "timestamp") {
      expect(f!.autoSet).toBe("update");
    }
  });

  // ── Permissions ────────────────────────────────────────────────────────

  it("read is public, write operations require admin", () => {
    expect(CHARACTER_CONFIG.permissions.read).toBe("public");
    expect(CHARACTER_CONFIG.permissions.create).toBe("admin");
    expect(CHARACTER_CONFIG.permissions.update).toBe("admin");
    expect(CHARACTER_CONFIG.permissions.delete).toBe("admin");
  });
});
