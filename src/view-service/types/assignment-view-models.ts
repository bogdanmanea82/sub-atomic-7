// src/view-service/types/assignment-view-models.ts
// View models for the Assignments tab (Screen 3).
// Represents resolved modifier eligibility — computed from bindings, not stored.

/** A single subcategory's resolved eligibility status. */
export interface ResolvedAssignment {
  readonly subcategoryName: string;
  readonly status: "included" | "excluded" | "none";
  readonly source: "explicit" | "category-inherited" | "none";
  readonly weightOverride: string;
  readonly tierRange: string;
  readonly levelReqOverride: string;
}

/** A category group with its resolved subcategory assignments. */
export interface AssignmentCategoryGroup {
  readonly categoryName: string;
  readonly categoryBinding: "included" | "excluded" | "none";
  readonly assignments: readonly ResolvedAssignment[];
}

/** Summary counts for the top of the panel. */
export interface AssignmentSummary {
  readonly totalSubcategories: number;
  readonly eligible: number;
  readonly excluded: number;
  readonly noBinding: number;
}

/** Complete data for the assignment panel. */
export interface AssignmentPanelData {
  readonly summary: AssignmentSummary;
  readonly groups: readonly AssignmentCategoryGroup[];
}
