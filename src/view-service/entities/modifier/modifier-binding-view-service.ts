// src/view-service/entities/item-modifie./modifier-binding-view-service.ts
// Layer 4 organism — view preparation for the Bindings tab panel.
//
// Transforms raw binding DB records into typed BindingDetailRow display objects.
// Resolves target_id UUIDs to human-readable names via caller-supplied lookup maps.
//
// Intentionally generic — future modifier types (EnemyModifier, ZoneModifier)
// follow the same pattern: instantiate their own service with the same signature.

import type { BindingDetailRow } from "../../types";
import { formatBindingOverrides } from "../../sub-atoms/formatters";

export const ModifierBindingViewService = {
  /**
   * Formats binding records for display in the Bindings tab panel.
   *
   * @param bindings       Raw DB rows for category OR subcategory bindings (one set at a time).
   * @param categoryLookup Map of category id → display name.
   * @param subcategoryLookup Map of subcategory id → display name.
   */
  preparePanel(
    bindings: readonly Record<string, unknown>[],
    categoryLookup: Record<string, string>,
    subcategoryLookup: Record<string, string>,
  ): readonly BindingDetailRow[] {
    return bindings.map((b) => {
      const targetType = b["target_type"] as string;
      const targetId = b["target_id"] as string;
      const lookup = targetType === "category" ? categoryLookup : subcategoryLookup;
      const targetName = lookup[targetId] ?? targetId;
      const { weightOverride, minTier, maxTier, levelReqOverride } = formatBindingOverrides(b);

      return {
        id: b["id"] as string,
        targetName,
        isIncluded: b["is_included"] as boolean,
        weightOverride,
        minTier,
        maxTier,
        levelReqOverride,
      };
    });
  },
};
