// src/view-service/entities/modifier/modifier-view-service.ts
// Layer 4 organism — complete view preparation interface for Modifier.
// Phase 2: includes tier data handling for forms and detail views.

import { MODIFIER_CONFIG } from "@config/entities/modifier";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta, ReferenceLookup } from "../../types";
import type { TierFormRow, TierDetailRow, TierFieldMeta } from "../../types";
import type { BindingDetailRow } from "../../types";
import type { AssignmentPanelData, AssignmentCategoryGroup, ResolvedAssignment, AssignmentSummary } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";
import { formatNumber } from "../../sub-atoms/formatters";

// Tier field metadata — used by browser JS to build new tier rows
const TIER_FIELD_META: readonly TierFieldMeta[] = [
  { name: "min_value", label: "Min Value", inputType: "number", step: "0.0001" },
  { name: "max_value", label: "Max Value", inputType: "number", step: "0.0001" },
  { name: "level_req", label: "Level Req", inputType: "number", min: 1, max: 99 },
  { name: "spawn_weight", label: "Spawn Weight", inputType: "number", min: 0, max: 10000 },
];

/**
 * Pre-binds MODIFIER_CONFIG so callers never import config directly.
 * Form methods accept four sets of FK options for cascading dropdowns.
 * Enum fields (affix_type, semantic_cat) auto-generate options from config via buildFormView.
 */
/** Fields excluded from modifier list view — shown as filter dropdowns instead */
const LIST_EXCLUDE_FIELDS = new Set([
  "game_domain_id", "game_subdomain_id", "game_category_id", "game_subcategory_id",
]);

export const ModifierViewService = {
  /**
   * Builds a filtered modifier list view without the 4 hierarchy columns.
   * Those columns are replaced by filter dropdowns above the table.
   */
  prepareFilteredListView(
    entities: Record<string, unknown>[],
    pagination?: PaginationMeta,
  ): ListView {
    const view = buildListView(entities, MODIFIER_CONFIG, undefined, pagination);
    return {
      ...view,
      columns: view.columns.filter((c) => !LIST_EXCLUDE_FIELDS.has(c.name)),
      rows: view.rows.map((r) => ({
        ...r,
        fields: r.fields.filter((f) => !LIST_EXCLUDE_FIELDS.has(f.name)),
      })),
    };
  },

  prepareDetailView(
    entity: Record<string, unknown>,
    referenceLookup?: ReferenceLookup,
    tiers?: readonly Record<string, unknown>[],
  ): DetailView & { readonly tierRows: readonly TierDetailRow[] } {
    const base = buildDetailView(entity, MODIFIER_CONFIG, referenceLookup);
    const tierRows: TierDetailRow[] = (tiers ?? []).map((t) => ({
      tier_index: Number(t["tier_index"]),
      min_value: formatNumber(Number(t["min_value"])),
      max_value: formatNumber(Number(t["max_value"])),
      level_req: formatNumber(Number(t["level_req"])),
      spawn_weight: formatNumber(Number(t["spawn_weight"])),
    }));
    return { ...base, tierRows };
  },

  prepareCreateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
    tierRows?: readonly TierFormRow[],
  ): FormView & { readonly tierRows: readonly TierFormRow[]; readonly tierFieldMeta: readonly TierFieldMeta[] } {
    const base = buildFormView(MODIFIER_CONFIG, values, errors, selectOptions);
    const defaultTier: TierFormRow = { tier_index: 0, min_value: null, max_value: null, level_req: 1, spawn_weight: 100 };
    return {
      ...base,
      tierRows: tierRows ?? [defaultTier],
      tierFieldMeta: TIER_FIELD_META,
    };
  },

  prepareEditForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
    tierRows?: readonly TierFormRow[],
  ): FormView & { readonly tierRows: readonly TierFormRow[]; readonly tierFieldMeta: readonly TierFieldMeta[] } {
    const base = buildFormView(MODIFIER_CONFIG, currentValues, errors, selectOptions);
    return {
      ...base,
      tierRows: tierRows ?? [],
      tierFieldMeta: TIER_FIELD_META,
    };
  },

  prepareDuplicateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    sourceValues: Record<string, unknown>,
    tierRows?: readonly TierFormRow[],
  ): FormView & { readonly tierRows: readonly TierFormRow[]; readonly tierFieldMeta: readonly TierFieldMeta[] } {
    const base = buildFormView(
      MODIFIER_CONFIG, sourceValues, undefined, selectOptions,
      `Duplicate ${MODIFIER_CONFIG.displayName}`,
    );
    return {
      ...base,
      tierRows: tierRows ?? [],
      tierFieldMeta: TIER_FIELD_META,
    };
  },

  /**
   * Formats binding records for display in the Bindings tab panel.
   * Resolves target_id UUIDs to human-readable names using the lookup maps.
   */
  prepareBindingPanel(
    bindings: readonly Record<string, unknown>[],
    categoryLookup: Record<string, string>,
    subcategoryLookup: Record<string, string>,
  ): readonly BindingDetailRow[] {
    return bindings.map((b) => {
      const targetType = b["target_type"] as string;
      const targetId = b["target_id"] as string;
      const lookup = targetType === "category" ? categoryLookup : subcategoryLookup;
      const targetName = lookup[targetId] ?? targetId;

      return {
        id: b["id"] as string,
        targetName,
        isIncluded: b["is_included"] as boolean,
        weightOverride: b["weight_override"] != null ? String(b["weight_override"]) : "Global default",
        minTier: b["min_tier_index"] != null ? String(b["min_tier_index"]) : "All tiers",
        maxTier: b["max_tier_index"] != null ? String(b["max_tier_index"]) : "All tiers",
        levelReqOverride: b["level_req_override"] != null ? String(b["level_req_override"]) : "Per tier default",
      };
    });
  },

  /**
   * Computes resolved eligibility for the Assignments tab.
   * Resolution rules:
   *   1. Explicit subcategory binding → use it
   *   2. No subcategory binding, but parent category has binding → inherit
   *   3. No binding at all → not eligible ("none")
   */
  prepareAssignmentPanel(
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

    // Group subcategories by category
    const subcatsByCat = new Map<string, { id: string; name: string }[]>();
    for (const sc of allSubcategories) {
      const list = subcatsByCat.get(sc.game_category_id) ?? [];
      list.push({ id: sc.id, name: sc.name });
      subcatsByCat.set(sc.game_category_id, list);
    }

    // Format override display strings from a binding record
    const formatOverrides = (b: Record<string, unknown>): {
      weightOverride: string; tierRange: string; levelReqOverride: string;
    } => {
      const weight = b["weight_override"];
      const minTier = b["min_tier_index"];
      const maxTier = b["max_tier_index"];
      const levelReq = b["level_req_override"];

      let tierRange = "All tiers";
      if (minTier != null && maxTier != null) {
        tierRange = `Tiers ${minTier}–${maxTier}`;
      } else if (minTier != null) {
        tierRange = `Tier ${minTier}+`;
      } else if (maxTier != null) {
        tierRange = `Tiers 0–${maxTier}`;
      }

      return {
        weightOverride: weight != null ? String(weight) : "Global default",
        tierRange,
        levelReqOverride: levelReq != null ? String(levelReq) : "Per tier default",
      };
    };

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
          return {
            subcategoryName: sc.name,
            status: isIncluded ? "included" as const : "excluded" as const,
            source: "explicit" as const,
            ...formatOverrides(subBinding),
          };
        }

        if (catBinding) {
          // Rule 2: Inherit from category binding
          if (catIncluded) eligible++; else excluded++;
          return {
            subcategoryName: sc.name,
            status: catIncluded ? "included" as const : "excluded" as const,
            source: "category-inherited" as const,
            ...formatOverrides(catBinding),
          };
        }

        // Rule 3: No binding
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

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(MODIFIER_CONFIG));
  },

  prepareTierFieldConfig(): string {
    return JSON.stringify(TIER_FIELD_META);
  },
};
