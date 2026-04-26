// src/view-service/entities/item/item-view-service.ts
// Layer 4 organism — complete view preparation interface for Item.
//
// Stat sheet strategy differs from CharacterClass:
//   create/edit forms show ALL stats with value 0 as default.
//   Saved ItemStatBase rows override the 0 for stats that have been set.
//   The service filters zeros before insert, so unsaved stats stay at 0 here.

import { ITEM_CONFIG } from "@config/entities/item";
import type { ListView, PaginationMeta, ReferenceLookup, SelectOption } from "../../types";
import type { ItemFormView, ItemDetailView, ItemStatBaseViewRow } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig, buildFilteredListView } from "../../molecules/views";
import { buildStatusFormExtension } from "../../sub-atoms";
import { MODIFIER_HIERARCHY_FIELDS } from "@config/molecules/modifier";

// ── Stat sheet helpers ─────────────────────────────────────────────────────────

function parseSubmittedValues(values?: Record<string, unknown>): Map<string, number> {
  const overrides = new Map<string, number>();
  const raw = values?.["stat_sheet_json"];
  if (typeof raw !== "string") return overrides;
  try {
    const parsed = JSON.parse(raw) as { stat_id: string; base_value: number }[];
    for (const row of parsed) {
      overrides.set(row.stat_id, row.base_value);
    }
  } catch {
    // ignore malformed JSON
  }
  return overrides;
}

/**
 * Builds stat sheet rows from all available stats.
 * base_value is 0 by default; saved values (or submitted values on error re-render)
 * take precedence. Only active stats are shown.
 */
function buildStatSheetFromAllStats(
  allStats: Record<string, unknown>[],
  savedValues: Map<string, number>,
  submittedOverrides: Map<string, number>,
  errors?: Record<string, string>,
): ItemStatBaseViewRow[] {
  return allStats
    .filter((s) => s["is_active"] !== false)
    .map((s) => {
      const statId = String(s["id"]);
      const savedVal = savedValues.get(statId) ?? 0;
      return {
        stat_id: statId,
        stat_name: String(s["name"] ?? ""),
        stat_category: String(s["category"] ?? ""),
        stat_data_type: String(s["data_type"] ?? ""),
        stat_value_min: Number(s["value_min"] ?? 0),
        stat_value_max: Number(s["value_max"] ?? 0),
        stat_default_value: Number(s["default_value"] ?? 0),
        combination_type: "flat",
        base_value: submittedOverrides.has(statId) ? submittedOverrides.get(statId)! : savedVal,
        error: errors?.[`stat_${statId}`],
      };
    })
    .sort((a, b) => a.stat_category.localeCompare(b.stat_category) || a.stat_name.localeCompare(b.stat_name));
}

/**
 * Builds stat sheet rows for detail view from saved ItemStatBase rows only.
 * Unlike form view, detail only shows stats that have been explicitly set.
 */
function buildStatSheetFromSaved(
  statSheet: Record<string, unknown>[],
): ItemStatBaseViewRow[] {
  return (statSheet as Record<string, unknown>[]).map((r) => ({
    stat_id: String(r["stat_id"]),
    stat_name: String(r["stat_name"] ?? ""),
    stat_category: String(r["stat_category"] ?? ""),
    stat_data_type: String(r["stat_data_type"] ?? ""),
    stat_value_min: Number(r["stat_value_min"] ?? 0),
    stat_value_max: Number(r["stat_value_max"] ?? 0),
    stat_default_value: Number(r["stat_default_value"] ?? 0),
    combination_type: String(r["combination_type"] ?? "flat"),
    base_value: Number(r["base_value"] ?? 0),
  }));
}

// ── Hierarchy filter field names (used by buildFilteredListView) ──────────────

const HIERARCHY_FIELD_NAMES = new Set(MODIFIER_HIERARCHY_FIELDS.map((f) => f.name));

// ── View service ──────────────────────────────────────────────────────────────

export const ItemViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, ITEM_CONFIG, referenceLookup, pagination);
  },

  prepareFilteredListView(
    entities: Record<string, unknown>[],
    pagination?: PaginationMeta,
    referenceLookup?: ReferenceLookup,
  ): ListView {
    const view = buildListView(entities, ITEM_CONFIG, referenceLookup, pagination);
    return buildFilteredListView(view, HIERARCHY_FIELD_NAMES);
  },

  prepareDetailView(
    entity: Record<string, unknown>,
    referenceLookup?: ReferenceLookup,
  ): ItemDetailView {
    const base = buildDetailView(entity, ITEM_CONFIG, referenceLookup);
    const rawSheet = Array.isArray(entity["statSheet"]) ? entity["statSheet"] as Record<string, unknown>[] : [];
    const statSheet = buildStatSheetFromSaved(rawSheet);
    return { ...base, statSheet };
  },

  prepareCreateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    allStats: Record<string, unknown>[],
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): ItemFormView {
    const base = buildFormView(ITEM_CONFIG, values, errors, selectOptions);
    const submittedOverrides = parseSubmittedValues(values);
    const statSheet = buildStatSheetFromAllStats(allStats, new Map(), submittedOverrides, errors);
    return { ...base, ...buildStatusFormExtension(values), statSheet };
  },

  prepareEditForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    currentValues: Record<string, unknown>,
    allStats: Record<string, unknown>[],
    submittedValues?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): ItemFormView {
    const displayValues = submittedValues ?? currentValues;
    const base = buildFormView(ITEM_CONFIG, displayValues, errors, selectOptions);
    // Build saved values map from the current stat sheet
    const rawSheet = Array.isArray(currentValues["statSheet"]) ? currentValues["statSheet"] as Record<string, unknown>[] : [];
    const savedValues = new Map<string, number>(
      rawSheet.map((r) => [String(r["stat_id"]), Number(r["base_value"] ?? 0)]),
    );
    const submittedOverrides = parseSubmittedValues(submittedValues);
    const statSheet = buildStatSheetFromAllStats(allStats, savedValues, submittedOverrides, errors);
    return { ...base, ...buildStatusFormExtension(displayValues), statSheet };
  },

  prepareDuplicateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    sourceValues: Record<string, unknown>,
    allStats: Record<string, unknown>[],
  ): ItemFormView {
    const base = buildFormView(
      ITEM_CONFIG,
      sourceValues,
      undefined,
      selectOptions,
      `Duplicate ${ITEM_CONFIG.displayName}`,
    );
    const rawSheet = Array.isArray(sourceValues["statSheet"]) ? sourceValues["statSheet"] as Record<string, unknown>[] : [];
    const savedValues = new Map<string, number>(
      rawSheet.map((r) => [String(r["stat_id"]), Number(r["base_value"] ?? 0)]),
    );
    const statSheet = buildStatSheetFromAllStats(allStats, savedValues, new Map());
    return { ...base, statSheet };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(ITEM_CONFIG));
  },
};
