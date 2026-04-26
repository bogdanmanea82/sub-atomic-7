// src/view-service/entities/stat/stat-view-service.ts
// Layer 4 organism — complete view preparation interface for Stat.
// Pre-binds STAT_CONFIG so callers never import config directly.

import { STAT_CONFIG } from "@config/entities/stat";
import type { ListView, DetailView, FormView, PaginationMeta, ReferenceLookup } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";
import { deriveCurrentState } from "../../sub-atoms";

export const StatViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, STAT_CONFIG, referenceLookup, pagination);
  },

  prepareDetailView(entity: Record<string, unknown>, referenceLookup?: ReferenceLookup): DetailView {
    return buildDetailView(entity, STAT_CONFIG, referenceLookup);
  },

  prepareCreateForm(
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    const base = buildFormView(STAT_CONFIG, values, errors);
    return { ...base, currentState: deriveCurrentState(values), statusReason: String(values?.["archived_reason"] ?? "") || undefined };
  },

  prepareEditForm(
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    const base = buildFormView(STAT_CONFIG, currentValues, errors);
    return { ...base, currentState: deriveCurrentState(currentValues), statusReason: String(currentValues["archived_reason"] ?? "") || undefined };
  },

  prepareDuplicateForm(sourceValues: Record<string, unknown>): FormView {
    const base = buildFormView(
      STAT_CONFIG, sourceValues, undefined, undefined,
      `Duplicate ${STAT_CONFIG.displayName}`,
    );
    return { ...base, currentState: "active" };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(STAT_CONFIG));
  },
};
