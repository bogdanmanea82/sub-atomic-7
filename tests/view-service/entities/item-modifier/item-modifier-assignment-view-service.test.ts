// tests/view-service/entities/item-modifier/item-modifier-assignment-view-service.test.ts
// Verifies the three-rule cascading eligibility resolution:
//   Rule 1: Explicit subcategory binding → use it directly
//   Rule 2: Parent category binding, no subcategory override → inherit
//   Rule 3: No binding at all → "none"
//
// Each rule is tested in isolation, then rule priority is verified.

import { describe, it, expect } from "bun:test";
import { ItemModifierAssignmentViewService } from "../../../../src/view-service/entities/item-modifier/item-modifier-assignment-view-service";

// ── Fixtures ───────────────────────────────────────────────────────────────────

const CAT_A = { id: "cat-a", name: "Category A" };
const CAT_B = { id: "cat-b", name: "Category B" };

const SUB_A1 = { id: "sub-a1", name: "Sub A1", game_category_id: "cat-a" };
const SUB_A2 = { id: "sub-a2", name: "Sub A2", game_category_id: "cat-a" };
const SUB_B1 = { id: "sub-b1", name: "Sub B1", game_category_id: "cat-b" };

function catBinding(targetId: string, isIncluded: boolean): Record<string, unknown> {
  return { id: `bind-cat-${targetId}`, target_type: "category", target_id: targetId, is_included: isIncluded, weight_override: null, min_tier_index: null, max_tier_index: null, level_req_override: null };
}

function subBinding(targetId: string, isIncluded: boolean): Record<string, unknown> {
  return { id: `bind-sub-${targetId}`, target_type: "subcategory", target_id: targetId, is_included: isIncluded, weight_override: null, min_tier_index: null, max_tier_index: null, level_req_override: null };
}

// ── Rule 3: No binding ─────────────────────────────────────────────────────────

describe("Rule 3 — no binding on subcategory or parent category", () => {
  it("assigns status 'none' and source 'none'", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [], [], [CAT_A], [SUB_A1],
    );
    const row = result.groups[0]!.assignments[0]!;
    expect(row.status).toBe("none");
    expect(row.source).toBe("none");
  });

  it("counts noBinding in the summary", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [], [], [CAT_A], [SUB_A1, SUB_A2],
    );
    expect(result.summary.noBinding).toBe(2);
    expect(result.summary.eligible).toBe(0);
    expect(result.summary.excluded).toBe(0);
  });
});

// ── Rule 2: Category binding inherited ────────────────────────────────────────

describe("Rule 2 — subcategory inherits category binding", () => {
  it("assigns source 'category-inherited' when category is included and subcategory has no binding", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", true)], [], [CAT_A], [SUB_A1],
    );
    const row = result.groups[0]!.assignments[0]!;
    expect(row.source).toBe("category-inherited");
    expect(row.status).toBe("included");
  });

  it("assigns status 'excluded' when the inherited category binding is excluded", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", false)], [], [CAT_A], [SUB_A1],
    );
    const row = result.groups[0]!.assignments[0]!;
    expect(row.source).toBe("category-inherited");
    expect(row.status).toBe("excluded");
  });

  it("counts correctly: 2 subcategories inherit an included category → eligible=2", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", true)], [], [CAT_A], [SUB_A1, SUB_A2],
    );
    expect(result.summary.eligible).toBe(2);
    expect(result.summary.excluded).toBe(0);
    expect(result.summary.noBinding).toBe(0);
  });
});

// ── Rule 1: Explicit subcategory binding ──────────────────────────────────────

describe("Rule 1 — explicit subcategory binding takes priority", () => {
  it("assigns source 'explicit' and status 'included'", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [], [subBinding("sub-a1", true)], [CAT_A], [SUB_A1],
    );
    const row = result.groups[0]!.assignments[0]!;
    expect(row.source).toBe("explicit");
    expect(row.status).toBe("included");
  });

  it("assigns source 'explicit' and status 'excluded'", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [], [subBinding("sub-a1", false)], [CAT_A], [SUB_A1],
    );
    const row = result.groups[0]!.assignments[0]!;
    expect(row.source).toBe("explicit");
    expect(row.status).toBe("excluded");
  });
});

// ── Rule priority: explicit overrides inherited ────────────────────────────────

describe("Rule priority — explicit subcategory binding overrides category binding", () => {
  it("uses the explicit subcategory binding even when the category is excluded", () => {
    // Category says excluded, but subcategory explicitly says included → Rule 1 wins
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", false)],
      [subBinding("sub-a1", true)],
      [CAT_A],
      [SUB_A1],
    );
    const row = result.groups[0]!.assignments[0]!;
    expect(row.source).toBe("explicit");
    expect(row.status).toBe("included");
  });

  it("uses the explicit subcategory binding even when the category is included", () => {
    // Category says included, but subcategory explicitly says excluded → Rule 1 wins
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", true)],
      [subBinding("sub-a1", false)],
      [CAT_A],
      [SUB_A1],
    );
    const row = result.groups[0]!.assignments[0]!;
    expect(row.source).toBe("explicit");
    expect(row.status).toBe("excluded");
  });
});

// ── Mixed scenario ────────────────────────────────────────────────────────────
// Two categories; each subcategory gets a different rule applied.

describe("Mixed rules across categories and subcategories", () => {
  it("applies all three rules correctly in a single call", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", true)],               // CAT_A is included (Rule 2 for its children)
      [subBinding("sub-b1", false)],             // SUB_B1 explicitly excluded (Rule 1)
      [CAT_A, CAT_B],
      [SUB_A1, SUB_A2, SUB_B1],
    );

    // CAT_A: SUB_A1 and SUB_A2 inherit included (Rule 2)
    const catAGroup = result.groups.find((g) => g.categoryName === "Category A")!;
    expect(catAGroup.assignments[0]!.source).toBe("category-inherited");
    expect(catAGroup.assignments[0]!.status).toBe("included");
    expect(catAGroup.assignments[1]!.source).toBe("category-inherited");

    // CAT_B: SUB_B1 explicit excluded (Rule 1)
    const catBGroup = result.groups.find((g) => g.categoryName === "Category B")!;
    expect(catBGroup.assignments[0]!.source).toBe("explicit");
    expect(catBGroup.assignments[0]!.status).toBe("excluded");

    // Summary: 2 eligible (inherited), 1 excluded (explicit)
    expect(result.summary.eligible).toBe(2);
    expect(result.summary.excluded).toBe(1);
    expect(result.summary.noBinding).toBe(0);
    expect(result.summary.totalSubcategories).toBe(3);
  });
});

// ── Category-level binding display ────────────────────────────────────────────

describe("Category binding summary on the group", () => {
  it("shows 'included' on the group when category has an included binding", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", true)], [], [CAT_A], [],
    );
    expect(result.groups[0]!.categoryBinding).toBe("included");
  });

  it("shows 'excluded' on the group when category has an excluded binding", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [catBinding("cat-a", false)], [], [CAT_A], [],
    );
    expect(result.groups[0]!.categoryBinding).toBe("excluded");
  });

  it("shows 'none' on the group when category has no binding", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [], [], [CAT_A], [],
    );
    expect(result.groups[0]!.categoryBinding).toBe("none");
  });
});

// ── Empty inputs ──────────────────────────────────────────────────────────────

describe("Empty inputs", () => {
  it("returns an empty groups array and zero summary when no categories exist", () => {
    const result = ItemModifierAssignmentViewService.preparePanel([], [], [], []);
    expect(result.groups).toHaveLength(0);
    expect(result.summary.totalSubcategories).toBe(0);
  });

  it("returns a group with no assignments when a category has no subcategories", () => {
    const result = ItemModifierAssignmentViewService.preparePanel(
      [], [], [CAT_A], [],
    );
    expect(result.groups[0]!.assignments).toHaveLength(0);
  });
});
