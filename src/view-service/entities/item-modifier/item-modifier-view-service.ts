// src/view-service/entities/item-modifier/item-modifier-view-service.ts
// Layer 4 organism — complete view preparation interface for ItemModifier.
// Phase 2: includes tier data handling for forms and detail views.

import { ITEM_MODIFIER_CONFIG } from "@config/entities/item-modifier";
import { MODIFIER_HIERARCHY_FIELDS, MODIFIER_TIER_FORM_META } from "@config/molecules/modifier";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta, ReferenceLookup } from "../../types";
import type { TierFormRow, TierDetailRow, TierFieldMeta } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";
import { formatNumber } from "../../sub-atoms/formatters";

// ── Status derivation ─────────────────────────────────────────────────────

/**
 * Derives the 3-state current status from raw entity/form values.
 * Called by all form-preparation methods so L5 receives a pre-computed
 * currentState and never needs to inspect field arrays itself.
 *
 * Rules (evaluated in order):
 *   1. archived_reason present → "archived"
 *   2. is_active === true (boolean or "true" string) → "active"
 *   3. otherwise → "disabled"
 *   4. no values (new entity) → "active" (default)
 */
function deriveCurrentState(values?: Record<string, unknown>): "active" | "disabled" | "archived" {
  if (!values) return "active";
  const archivedReason = values["archived_reason"];
  if (archivedReason != null && archivedReason !== "") return "archived";
  const isActive = values["is_active"] === true || values["is_active"] === "true";
  return isActive ? "active" : "disabled";
}

// ── Tier field metadata ───────────────────────────────────────────────────
// MODIFIER_TIER_FORM_META lives in L0 (src/config/molecules/modifier/tiers-fields.ts).
// Imported above; referenced below as-is — TierFieldMeta is structurally compatible.

/**
 * Pre-binds ITEM_MODIFIER_CONFIG so callers never import config directly.
 * Form methods accept four sets of FK options for cascading dropdowns.
 * Enum fields (affix_type, combination_type, roll_shape) auto-generate options from config via buildFormView.
 */
/** Fields excluded from modifier list view — shown as filter dropdowns instead */
const LIST_EXCLUDE_FIELDS = new Set<string>(MODIFIER_HIERARCHY_FIELDS.map((f) => f.name));

export const ItemModifierViewService = {
  /**
   * Builds a filtered modifier list view without the 4 hierarchy columns.
   * Those columns are replaced by filter dropdowns above the table.
   */
  prepareFilteredListView(
    entities: Record<string, unknown>[],
    pagination?: PaginationMeta,
  ): ListView {
    const view = buildListView(entities, ITEM_MODIFIER_CONFIG, undefined, pagination);
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
    const base = buildDetailView(entity, ITEM_MODIFIER_CONFIG, referenceLookup);
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
  ): FormView & { readonly tierRows: readonly TierFormRow[]; readonly tierFieldMeta: readonly TierFieldMeta[]; readonly currentState: "active" | "disabled" | "archived" } {
    const base = buildFormView(ITEM_MODIFIER_CONFIG, values, errors, selectOptions);
    const defaultTier: TierFormRow = { tier_index: 0, min_value: null, max_value: null, level_req: 1, spawn_weight: 100 };
    return {
      ...base,
      tierRows: tierRows ?? [defaultTier],
      tierFieldMeta: MODIFIER_TIER_FORM_META,
      currentState: deriveCurrentState(values),
    };
  },

  prepareEditForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
    tierRows?: readonly TierFormRow[],
  ): FormView & { readonly tierRows: readonly TierFormRow[]; readonly tierFieldMeta: readonly TierFieldMeta[]; readonly currentState: "active" | "disabled" | "archived" } {
    const base = buildFormView(ITEM_MODIFIER_CONFIG, currentValues, errors, selectOptions);
    return {
      ...base,
      tierRows: tierRows ?? [],
      tierFieldMeta: MODIFIER_TIER_FORM_META,
      currentState: deriveCurrentState(currentValues),
    };
  },

  prepareDuplicateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    sourceValues: Record<string, unknown>,
    tierRows?: readonly TierFormRow[],
  ): FormView & { readonly tierRows: readonly TierFormRow[]; readonly tierFieldMeta: readonly TierFieldMeta[]; readonly currentState: "active" | "disabled" | "archived" } {
    const base = buildFormView(
      ITEM_MODIFIER_CONFIG, sourceValues, undefined, selectOptions,
      `Duplicate ${ITEM_MODIFIER_CONFIG.displayName}`,
    );
    return {
      ...base,
      tierRows: tierRows ?? [],
      tierFieldMeta: MODIFIER_TIER_FORM_META,
      currentState: "active", // duplicates always start active regardless of source
    };
  },

  /**
   * Converts raw tier DB records (from service findById) into typed form rows.
   * Coerces each numeric field via Number() — DB rows arrive as unknown Record.
   * Lives here (L4) not in L3, because transforming data shape for rendering
   * is a view preparation concern, not an HTTP handling concern.
   */
  tiersToFormRows(tiers: readonly Record<string, unknown>[]): readonly TierFormRow[] {
    return tiers.map((t) => ({
      tier_index: Number(t["tier_index"]),
      min_value: t["min_value"] != null ? Number(t["min_value"]) : null,
      max_value: t["max_value"] != null ? Number(t["max_value"]) : null,
      level_req: Number(t["level_req"]),
      spawn_weight: Number(t["spawn_weight"]),
    }));
  },

  /**
   * Parses tiers_json from a POST body back into form rows for re-rendering on error.
   * Returns [] on blank input or parse failure — the form simply shows no tiers.
   */
  parseTiersJsonForRerender(input: Record<string, unknown>): readonly TierFormRow[] {
    const raw = input["tiers_json"];
    if (typeof raw !== "string" || raw.trim() === "") return [];
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>[];
      return ItemModifierViewService.tiersToFormRows(parsed);
    } catch {
      return [];
    }
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(ITEM_MODIFIER_CONFIG));
  },

  prepareTierFieldConfig(): string {
    return JSON.stringify(MODIFIER_TIER_FORM_META);
  },
};
