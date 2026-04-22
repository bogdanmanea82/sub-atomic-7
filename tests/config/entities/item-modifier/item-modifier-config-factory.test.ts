// tests/config/entities/item-modifier/item-modifier-config-factory.test.ts
// Verifies ITEM_MODIFIER_CONFIG has the correct non-column keys, table name, and field composition.
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
});
