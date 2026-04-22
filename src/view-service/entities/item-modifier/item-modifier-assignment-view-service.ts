// src/view-service/entities/item-modifier/item-modifier-assignment-view-service.ts
// Layer 4 organism — view preparation for the Assignments tab panel.
//
// Computes resolved modifier eligibility for all subcategories by applying
// three cascading rules in priority order:
//   1. Explicit subcategory binding → use it directly
//   2. Parent category binding (no subcategory override) → inherit
//   3. No binding at all → "none"
//
// This is a pure computation — nothing is stored in the DB.
// The result is read-only and never submitted back to the server.

import type { AssignmentPanelData, AssignmentCategoryGroup, ResolvedAssignment, AssignmentSummary } from "../../types";
import { formatBindingOverrides } from "../../sub-atoms/formatters";

export const ItemModifierAssignmentViewService = {
  /**
   * Builds the full assignment panel data for the Assignments tab.
   *
   * @param categoryBindings    Raw category-level binding DB rows for this modifier.
   * @param subcategoryBindings Raw subcategory-level binding DB rows for this modifier.
   * @param allCategories       Every category (for building the group list).
   * @param allSubcategories    Every subcategory with its parent category id.
   */
  preparePanel(
    categoryBindings: readonly Record<string, unknown>[],
    subcategoryBindings: readonly Record<string, unknown>[],
    allCategories: readonly { id: string; name: string }[],
    allSubcategories: readonly { id: string; name: string; game_category_id: string }[],
  ): AssignmentPanelData {
    // Build lookup maps: binding target_id → binding record
    const catBindingMap = new Map<string, Record<string, unknown>>();
    for (const b of categoryBindings) {
      catBindingMap.set(b["target_id"] as string, b);
    }
    const subBindingMap = new Map<string, Record<string, unknown>>();
    for (const b of subcategoryBindings) {
      subBindingMap.set(b["target_id"] as string, b);
    }

    // Group subcategories by their parent category
    const subcatsByCat = new Map<string, { id: string; name: string }[]>();
    for (const sc of allSubcategories) {
      const list = subcatsByCat.get(sc.game_category_id) ?? [];
      list.push({ id: sc.id, name: sc.name });
      subcatsByCat.set(sc.game_category_id, list);
    }

    let eligible = 0;
    let excluded = 0;
    let noBinding = 0;

    const groups: AssignmentCategoryGroup[] = allCategories.map((cat) => {
      const catBinding = catBindingMap.get(cat.id);
      const catIncluded = catBinding ? (catBinding["is_included"] as boolean) : null;
      const categoryBinding: "included" | "excluded" | "none" =
        catIncluded === true ? "included" : catIncluded === false ? "excluded" : "none";

      const subcats = subcatsByCat.get(cat.id) ?? [];

      const assignments: ResolvedAssignment[] = subcats.map((sc) => {
        const subBinding = subBindingMap.get(sc.id);

        if (subBinding) {
          // Rule 1: Explicit subcategory binding
          const isIncluded = subBinding["is_included"] as boolean;
          if (isIncluded) eligible++; else excluded++;
          const { weightOverride, tierRange, levelReqOverride } = formatBindingOverrides(subBinding);
          return {
            subcategoryName: sc.name,
            status: isIncluded ? "included" as const : "excluded" as const,
            source: "explicit" as const,
            weightOverride,
            tierRange,
            levelReqOverride,
          };
        }

        if (catBinding) {
          // Rule 2: Inherit from category binding
          if (catIncluded) eligible++; else excluded++;
          const { weightOverride, tierRange, levelReqOverride } = formatBindingOverrides(catBinding);
          return {
            subcategoryName: sc.name,
            status: catIncluded ? "included" as const : "excluded" as const,
            source: "category-inherited" as const,
            weightOverride,
            tierRange,
            levelReqOverride,
          };
        }

        // Rule 3: No binding at all
        noBinding++;
        return {
          subcategoryName: sc.name,
          status: "none" as const,
          source: "none" as const,
          weightOverride: "—",
          tierRange: "—",
          levelReqOverride: "—",
        };
      });

      return { categoryName: cat.name, categoryBinding, assignments };
    });

    const summary: AssignmentSummary = {
      totalSubcategories: eligible + excluded + noBinding,
      eligible,
      excluded,
      noBinding,
    };

    return { summary, groups };
  },
};
