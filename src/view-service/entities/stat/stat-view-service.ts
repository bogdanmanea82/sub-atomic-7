// src/view-service/entities/stat/stat-view-service.ts
// Layer 4 organism — complete view preparation interface for Stat.
// Pre-binds STAT_CONFIG so callers never import config directly.

import { STAT_CONFIG } from "@config/entities/stat";
import type { ListView, DetailView, FormView, PaginationMeta } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";

export const StatViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, STAT_CONFIG, undefined, pagination);
  },

  prepareDetailView(entity: Record<string, unknown>): DetailView {
    return buildDetailView(entity, STAT_CONFIG);
  },

  prepareCreateForm(
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(STAT_CONFIG, values, errors);
  },

  prepareEditForm(
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(STAT_CONFIG, currentValues, errors);
  },

  prepareDuplicateForm(sourceValues: Record<string, unknown>): FormView {
    return buildFormView(
      STAT_CONFIG, sourceValues, undefined, undefined,
      `Duplicate ${STAT_CONFIG.displayName}`,
    );
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(STAT_CONFIG));
  },
};
