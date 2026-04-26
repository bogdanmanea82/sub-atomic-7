// src/view-service/entities/character-class/character-class-view-service.ts
// Layer 4 organism — complete view preparation interface for CharacterClass.
//
// The stat sheet (character_stat_base rows) is pre-merged into all form and
// detail views. allStats (for create) and characterWithStats.statSheet (for
// edit/detail) are the two data sources — the view service normalises both
// into the same StatSheetViewRow[] shape before returning.

import { CHARACTER_CLASS_CONFIG } from "@config/entities/character-class";
import type { ListView, PaginationMeta, ReferenceLookup } from "../../types";
import type { CharacterClassFormView, CharacterClassDetailView, StatSheetViewRow } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";
import { buildStatusFormExtension } from "../../sub-atoms";

// ── Stat sheet helpers ─────────────────────────────────────────────────────────

/**
 * Parses the stat_sheet_json string from a form submission into a
 * Map<stat_id, base_value> for quick lookup during error re-renders.
 */
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
    // ignore malformed JSON — fall through with empty map
  }
  return overrides;
}

/**
 * Builds a StatSheetViewRow[] from raw Stat entity rows (create form path).
 * base_value defaults to stat.default_value; overrides from submitted values
 * take precedence on error re-renders.
 */
function buildStatSheetFromAllStats(
  allStats: Record<string, unknown>[],
  overrides: Map<string, number>,
  errors?: Record<string, string>,
): StatSheetViewRow[] {
  return allStats
    .filter((s) => s["is_active"] !== false)
    .map((s) => {
      const statId = String(s["id"]);
      const defaultVal = Number(s["default_value"] ?? 0);
      return {
        stat_id: statId,
        stat_name: String(s["name"] ?? ""),
        stat_category: String(s["category"] ?? ""),
        stat_data_type: String(s["data_type"] ?? ""),
        stat_value_min: Number(s["value_min"] ?? 0),
        stat_value_max: Number(s["value_max"] ?? 0),
        stat_default_value: defaultVal,
        base_value: overrides.get(statId) ?? defaultVal,
        error: errors?.[`stat_${statId}`],
      };
    })
    .sort((a, b) => a.stat_category.localeCompare(b.stat_category) || a.stat_name.localeCompare(b.stat_name));
}

/**
 * Builds a StatSheetViewRow[] from an already-joined CharacterClassWithStats
 * result (edit/detail path). Submitted overrides replace base_values on error re-renders.
 */
function buildStatSheetFromSaved(
  statSheet: Record<string, unknown>[],
  overrides: Map<string, number>,
  errors?: Record<string, string>,
): StatSheetViewRow[] {
  return (statSheet as Record<string, unknown>[]).map((r) => {
    const statId = String(r["stat_id"]);
    return {
      stat_id: statId,
      stat_name: String(r["stat_name"] ?? ""),
      stat_category: String(r["stat_category"] ?? ""),
      stat_data_type: String(r["stat_data_type"] ?? ""),
      stat_value_min: Number(r["stat_value_min"] ?? 0),
      stat_value_max: Number(r["stat_value_max"] ?? 0),
      stat_default_value: Number(r["stat_default_value"] ?? 0),
      base_value: overrides.has(statId) ? overrides.get(statId)! : Number(r["base_value"] ?? 0),
      error: errors?.[`stat_${statId}`],
    };
  });
}

// ── View service ──────────────────────────────────────────────────────────────

export const CharacterClassViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, CHARACTER_CLASS_CONFIG, referenceLookup, pagination);
  },

  prepareDetailView(entity: Record<string, unknown>): CharacterClassDetailView {
    const base = buildDetailView(entity, CHARACTER_CLASS_CONFIG);
    const rawSheet = Array.isArray(entity["statSheet"]) ? entity["statSheet"] as Record<string, unknown>[] : [];
    const statSheet = buildStatSheetFromSaved(rawSheet, new Map());
    return { ...base, statSheet };
  },

  prepareCreateForm(
    allStats: Record<string, unknown>[],
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): CharacterClassFormView {
    const base = buildFormView(CHARACTER_CLASS_CONFIG, values, errors);
    const overrides = parseSubmittedValues(values);
    const statSheet = buildStatSheetFromAllStats(allStats, overrides, errors);
    return { ...base, ...buildStatusFormExtension(values), statSheet };
  },

  prepareEditForm(
    currentValues: Record<string, unknown>,
    submittedValues?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): CharacterClassFormView {
    const displayValues = submittedValues ?? currentValues;
    const base = buildFormView(CHARACTER_CLASS_CONFIG, displayValues, errors);
    const overrides = parseSubmittedValues(submittedValues);
    const rawSheet = Array.isArray(currentValues["statSheet"]) ? currentValues["statSheet"] as Record<string, unknown>[] : [];
    const statSheet = buildStatSheetFromSaved(rawSheet, overrides, errors);
    return { ...base, ...buildStatusFormExtension(displayValues), statSheet };
  },

  prepareDuplicateForm(sourceValues: Record<string, unknown>): CharacterClassFormView {
    const base = buildFormView(
      CHARACTER_CLASS_CONFIG,
      sourceValues,
      undefined,
      undefined,
      `Duplicate ${CHARACTER_CLASS_CONFIG.displayName}`,
    );
    const rawSheet = Array.isArray(sourceValues["statSheet"]) ? sourceValues["statSheet"] as Record<string, unknown>[] : [];
    const statSheet = buildStatSheetFromSaved(rawSheet, new Map());
    return { ...base, currentState: "active", statSheet };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(CHARACTER_CLASS_CONFIG));
  },
};
