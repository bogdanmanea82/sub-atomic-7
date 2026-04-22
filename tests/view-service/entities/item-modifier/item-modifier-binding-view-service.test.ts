// tests/view-service/entities/item-modifier/item-modifier-binding-view-service.test.ts
// Verifies the binding record → BindingDetailRow transformation:
// target_id UUID resolution via lookup maps and correct field extraction.

import { describe, it, expect } from "bun:test";
import { ItemModifierBindingViewService } from "../../../../src/view-service/entities/item-modifier/item-modifier-binding-view-service";

const categoryLookup: Record<string, string> = {
  "cat-111": "Swords",
  "cat-222": "Bows",
};
const subcategoryLookup: Record<string, string> = {
  "sub-111": "1H Swords",
  "sub-222": "2H Swords",
};

function makeBinding(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "bind-aaa",
    target_type: "category",
    target_id: "cat-111",
    is_included: true,
    weight_override: null,
    min_tier_index: null,
    max_tier_index: null,
    level_req_override: null,
    ...overrides,
  };
}

describe("ItemModifierBindingViewService.preparePanel", () => {
  // ── Empty input ────────────────────────────────────────────────────────────

  it("returns an empty array for empty bindings", () => {
    const result = ItemModifierBindingViewService.preparePanel([], categoryLookup, subcategoryLookup);
    expect(result).toHaveLength(0);
  });

  // ── Field extraction ──────────────────────────────────────────────────────

  it("passes through id unchanged", () => {
    const result = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ id: "bind-xyz" })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(result[0]!.id).toBe("bind-xyz");
  });

  it("extracts is_included as a boolean", () => {
    const included = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ is_included: true })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(included[0]!.isIncluded).toBe(true);

    const excluded = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ is_included: false })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(excluded[0]!.isIncluded).toBe(false);
  });

  // ── Target name resolution ────────────────────────────────────────────────

  it("resolves target_id to category name when target_type is 'category'", () => {
    const result = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ target_type: "category", target_id: "cat-111" })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(result[0]!.targetName).toBe("Swords");
  });

  it("resolves target_id to subcategory name when target_type is 'subcategory'", () => {
    const result = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ target_type: "subcategory", target_id: "sub-222" })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(result[0]!.targetName).toBe("2H Swords");
  });

  it("falls back to the raw target_id when it is absent from the lookup", () => {
    const result = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ target_type: "category", target_id: "unknown-uuid" })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(result[0]!.targetName).toBe("unknown-uuid");
  });

  // ── Override field formatting ─────────────────────────────────────────────
  // These flow through formatBindingOverrides — the formatter itself is tested
  // separately; here we just verify the values reach the output row.

  it("weightOverride is 'Global default' when weight_override is null", () => {
    const result = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ weight_override: null })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(result[0]!.weightOverride).toBe("Global default");
  });

  it("weightOverride is the string value when weight_override is set", () => {
    const result = ItemModifierBindingViewService.preparePanel(
      [makeBinding({ weight_override: 50 })],
      categoryLookup,
      subcategoryLookup,
    );
    expect(result[0]!.weightOverride).toBe("50");
  });

  // ── Multiple bindings ─────────────────────────────────────────────────────

  it("transforms all bindings and preserves order", () => {
    const result = ItemModifierBindingViewService.preparePanel(
      [
        makeBinding({ id: "b1", target_type: "category",    target_id: "cat-111" }),
        makeBinding({ id: "b2", target_type: "subcategory", target_id: "sub-111" }),
      ],
      categoryLookup,
      subcategoryLookup,
    );
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("b1");
    expect(result[0]!.targetName).toBe("Swords");
    expect(result[1]!.id).toBe("b2");
    expect(result[1]!.targetName).toBe("1H Swords");
  });
});
