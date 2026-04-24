// tests/config/entities/item-modifier/item-modifier-config-factory.test.ts
// Verifies ITEM_MODIFIER_CONFIG has the correct non-column keys, table name, and field composition.
// Also verifies the Milestone 2 refactor: old fields removed, new mechanical fields present.
// Pure unit tests — no database.

import { describe, it, expect } from "bun:test";
import { ITEM_MODIFIER_CONFIG } from "../../../../src/config/entities/item-modifier";

describe("ITEM_MODIFIER_CONFIG", () => {
  // ── Identity ───────────────────────────────────────────────────────────────

  it("has entity name 'ItemModifier'", () => {
    expect(ITEM_MODIFIER_CONFIG.name).toBe("ItemModifier");
  });

  it("has tableName 'item_modifier' (snake_case of ItemModifier)", () => {
    expect(ITEM_MODIFIER_CONFIG.tableName).toBe("item_modifier");
  });

  it("has correct display names", () => {
    expect(ITEM_MODIFIER_CONFIG.displayName).toBe("Item Modifier");
    expect(ITEM_MODIFIER_CONFIG.pluralDisplayName).toBe("Item Modifiers");
  });

  // ── nonColumnKeys — the four virtual form fields ───────────────────────────
  // These must be stripped before any DB UPDATE to avoid "unknown column" errors.

  it("has a nonColumnKeys array", () => {
    expect(Array.isArray(ITEM_MODIFIER_CONFIG.nonColumnKeys)).toBe(true);
  });

  it("nonColumnKeys contains 'tiers_json' (serialised tier array from browser)", () => {
    expect(ITEM_MODIFIER_CONFIG.nonColumnKeys).toContain("tiers_json");
  });

  it("nonColumnKeys contains 'tiers' (deserialized defensive copy)", () => {
    expect(ITEM_MODIFIER_CONFIG.nonColumnKeys).toContain("tiers");
  });

  it("nonColumnKeys contains 'status_action' (radio value → is_active translation)", () => {
    expect(ITEM_MODIFIER_CONFIG.nonColumnKeys).toContain("status_action");
  });

  it("nonColumnKeys contains 'status_reason' (textarea consumed by applyStatusAction)", () => {
    expect(ITEM_MODIFIER_CONFIG.nonColumnKeys).toContain("status_reason");
  });

  it("nonColumnKeys has exactly 4 entries — no accidental extras or omissions", () => {
    expect(ITEM_MODIFIER_CONFIG.nonColumnKeys).toHaveLength(4);
  });

  // ── Relationships ──────────────────────────────────────────────────────────

  it("has 4 belongsTo relationships (domain, subdomain, category, subcategory)", () => {
    expect(ITEM_MODIFIER_CONFIG.relationships).toHaveLength(4);
  });

  it("all relationships are of type 'belongsTo'", () => {
    const types = ITEM_MODIFIER_CONFIG.relationships?.map((r) => r.type) ?? [];
    expect(types.every((t) => t === "belongsTo")).toBe(true);
  });

  // ── Permissions ────────────────────────────────────────────────────────────

  it("read is public, write operations require admin", () => {
    expect(ITEM_MODIFIER_CONFIG.permissions.read).toBe("public");
    expect(ITEM_MODIFIER_CONFIG.permissions.create).toBe("admin");
    expect(ITEM_MODIFIER_CONFIG.permissions.update).toBe("admin");
    expect(ITEM_MODIFIER_CONFIG.permissions.delete).toBe("admin");
  });

  // ── Milestone 2 refactor: old fields removed ───────────────────────────────
  // semantic_cat / calc_method / value_type were replaced by the stat FK + mechanical fields.

  it("does NOT have semantic_cat field (replaced by stat.category)", () => {
    const names = ITEM_MODIFIER_CONFIG.fields.map((f) => f.name);
    expect(names).not.toContain("semantic_cat");
  });

  it("does NOT have calc_method field (replaced by combination_type)", () => {
    const names = ITEM_MODIFIER_CONFIG.fields.map((f) => f.name);
    expect(names).not.toContain("calc_method");
  });

  it("does NOT have value_type field (replaced by combination_type + roll_shape)", () => {
    const names = ITEM_MODIFIER_CONFIG.fields.map((f) => f.name);
    expect(names).not.toContain("value_type");
  });

  // ── Milestone 2 refactor: new mechanical fields present ───────────────────

  it("has target_stat_id as a required reference to the Stat entity", () => {
    const f = ITEM_MODIFIER_CONFIG.fields.find((f) => f.name === "target_stat_id");
    expect(f).toBeDefined();
    expect(f!.type).toBe("reference");
    expect(f!.required).toBe(true);
    if (f!.type === "reference") {
      expect(f!.targetEntity).toBe("Stat");
      expect(f!.targetTable).toBe("stat");
    }
  });

  it("has combination_type as a required enum with flat, increased, more", () => {
    const f = ITEM_MODIFIER_CONFIG.fields.find((f) => f.name === "combination_type");
    expect(f).toBeDefined();
    expect(f!.type).toBe("enum");
    expect(f!.required).toBe(true);
    if (f!.type === "enum") {
      expect(f!.values).toContain("flat");
      expect(f!.values).toContain("increased");
      expect(f!.values).toContain("more");
      expect(f!.values).toHaveLength(3);
    }
  });

  it("has roll_shape as a required enum with scalar, range", () => {
    const f = ITEM_MODIFIER_CONFIG.fields.find((f) => f.name === "roll_shape");
    expect(f).toBeDefined();
    expect(f!.type).toBe("enum");
    expect(f!.required).toBe(true);
    if (f!.type === "enum") {
      expect(f!.values).toContain("scalar");
      expect(f!.values).toContain("range");
      expect(f!.values).toHaveLength(2);
    }
  });

  it("has value_min as a required integer with signed range", () => {
    const f = ITEM_MODIFIER_CONFIG.fields.find((f) => f.name === "value_min");
    expect(f).toBeDefined();
    expect(f!.type).toBe("integer");
    expect(f!.required).toBe(true);
    if (f!.type === "integer") {
      expect(f!.min).toBe(-2147483648);
    }
  });

  it("has value_max as a required integer with signed range", () => {
    const f = ITEM_MODIFIER_CONFIG.fields.find((f) => f.name === "value_max");
    expect(f).toBeDefined();
    expect(f!.type).toBe("integer");
    expect(f!.required).toBe(true);
    if (f!.type === "integer") {
      expect(f!.min).toBe(-2147483648);
    }
  });

  it("has modifier_group as a required string field", () => {
    const f = ITEM_MODIFIER_CONFIG.fields.find((f) => f.name === "modifier_group");
    expect(f).toBeDefined();
    expect(f!.type).toBe("string");
    expect(f!.required).toBe(true);
  });

  it("has display_template as a required string field using textarea", () => {
    const f = ITEM_MODIFIER_CONFIG.fields.find((f) => f.name === "display_template");
    expect(f).toBeDefined();
    expect(f!.type).toBe("string");
    expect(f!.required).toBe(true);
    expect(f!.displayFormat).toBe("textarea");
  });
});
