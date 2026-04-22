// tests/config/entities/modifier-tier/modifier-tier-config.test.ts
import { describe, it, expect } from "bun:test";
import { ITEM_MODIFIER_TIER_CONFIG } from "@config/entities/item-modifier-tier";

describe("ITEM_MODIFIER_TIER_CONFIG", () => {
  // ── Entity metadata ────────────────────────────────────────────────────
  it("has correct entity name", () => {
    expect(ITEM_MODIFIER_TIER_CONFIG.name).toBe("ItemModifierTier");
  });

  it("has correct table name (snake_case)", () => {
    expect(ITEM_MODIFIER_TIER_CONFIG.tableName).toBe("item_modifier_tier");
  });

  it("has correct display names", () => {
    expect(ITEM_MODIFIER_TIER_CONFIG.displayName).toBe("Item Modifier Tier");
    expect(ITEM_MODIFIER_TIER_CONFIG.pluralDisplayName).toBe("Item Modifier Tiers");
  });

  // ── Field count ────────────────────────────────────────────────────────
  it("has exactly 9 fields (id + 5 tier fields + modifier_id + 2 audit)", () => {
    expect(ITEM_MODIFIER_TIER_CONFIG.fields).toHaveLength(9);
  });

  // ── Field order ────────────────────────────────────────────────────────
  it("has fields in correct order", () => {
    const names = ITEM_MODIFIER_TIER_CONFIG.fields.map((f) => f.name);
    expect(names).toEqual([
      "id", "modifier_id", "tier_index",
      "min_value", "max_value", "level_req", "spawn_weight",
      "created_at", "updated_at",
    ]);
  });

  // ── No standard entity fields (name/description/is_active) ────────────
  it("does NOT have name field", () => {
    const nameField = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "name");
    expect(nameField).toBeUndefined();
  });

  it("does NOT have description field", () => {
    const descField = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "description");
    expect(descField).toBeUndefined();
  });

  it("does NOT have is_active field", () => {
    const isActiveField = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "is_active");
    expect(isActiveField).toBeUndefined();
  });

  // ── Decimal fields ─────────────────────────────────────────────────────
  it("min_value is a required decimal with precision 12, scale 4", () => {
    const field = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "min_value");
    expect(field).toBeDefined();
    expect(field!.type).toBe("decimal");
    expect(field!.required).toBe(true);
    if (field!.type === "decimal") {
      expect(field!.precision).toBe(12);
      expect(field!.scale).toBe(4);
    }
  });

  it("max_value is a required decimal with precision 12, scale 4", () => {
    const field = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "max_value");
    expect(field).toBeDefined();
    expect(field!.type).toBe("decimal");
    if (field!.type === "decimal") {
      expect(field!.precision).toBe(12);
      expect(field!.scale).toBe(4);
    }
  });

  // ── Integer fields ─────────────────────────────────────────────────────
  it("tier_index is a required integer 0-999", () => {
    const field = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "tier_index");
    expect(field).toBeDefined();
    expect(field!.type).toBe("integer");
    if (field!.type === "integer") {
      expect(field!.min).toBe(0);
      expect(field!.max).toBe(999);
    }
  });

  it("level_req is a required integer 1-99", () => {
    const field = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "level_req");
    expect(field).toBeDefined();
    expect(field!.type).toBe("integer");
    if (field!.type === "integer") {
      expect(field!.min).toBe(1);
      expect(field!.max).toBe(99);
    }
  });

  it("spawn_weight is a required integer 0-10000", () => {
    const field = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "spawn_weight");
    expect(field).toBeDefined();
    expect(field!.type).toBe("integer");
    if (field!.type === "integer") {
      expect(field!.min).toBe(0);
      expect(field!.max).toBe(10000);
    }
  });

  // ── Reference field ────────────────────────────────────────────────────
  it("modifier_id references modifier table", () => {
    const field = ITEM_MODIFIER_TIER_CONFIG.fields.find((f) => f.name === "modifier_id");
    expect(field).toBeDefined();
    expect(field!.type).toBe("reference");
    if (field!.type === "reference") {
      expect(field!.targetTable).toBe("item_modifier");
      expect(field!.targetEntity).toBe("ItemModifier");
    }
  });

  // ── Permissions ────────────────────────────────────────────────────────
  it("read is public, write operations require admin", () => {
    expect(ITEM_MODIFIER_TIER_CONFIG.permissions.read).toBe("public");
    expect(ITEM_MODIFIER_TIER_CONFIG.permissions.create).toBe("admin");
  });
});
