// src/view-service/entities/modifier/modifier-view-service.ts
// Layer 4 organism — complete view preparation interface for Modifier.
// Phase 2: includes tier data handling for forms and detail views.

import { MODIFIER_CONFIG } from "@config/entities/modifier";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta, ReferenceLookup } from "../../types";
import type { TierFormRow, TierDetailRow, TierFieldMeta } from "../../types";
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
export const ModifierViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, MODIFIER_CONFIG, referenceLookup, pagination);
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

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(MODIFIER_CONFIG));
  },

  prepareTierFieldConfig(): string {
    return JSON.stringify(TIER_FIELD_META);
  },
};
