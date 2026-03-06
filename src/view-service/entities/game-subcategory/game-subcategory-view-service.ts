// src/view-service/entities/game-subcategory/game-subcategory-view-service.ts
// Layer 4 organism — complete view preparation interface for GameSubcategory

import { GAME_SUBCATEGORY_CONFIG } from "@config/entities/game-subcategory";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta, ReferenceLookup } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";

/**
 * Pre-binds GAME_SUBCATEGORY_CONFIG so callers never import config directly.
 * Form methods accept three sets of options for the cascading dropdowns.
 * List/detail methods accept a referenceLookup to resolve all three parent UUIDs.
 */
export const GameSubcategoryViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, GAME_SUBCATEGORY_CONFIG, referenceLookup, pagination);
  },

  prepareDetailView(
    entity: Record<string, unknown>,
    referenceLookup?: ReferenceLookup,
  ): DetailView {
    return buildDetailView(entity, GAME_SUBCATEGORY_CONFIG, referenceLookup);
  },

  prepareCreateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(GAME_SUBCATEGORY_CONFIG, values, errors, selectOptions);
  },

  prepareEditForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(GAME_SUBCATEGORY_CONFIG, currentValues, errors, selectOptions);
  },

  prepareDuplicateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    sourceValues: Record<string, unknown>,
  ): FormView {
    return buildFormView(
      GAME_SUBCATEGORY_CONFIG, sourceValues, undefined, selectOptions,
      `Duplicate ${GAME_SUBCATEGORY_CONFIG.displayName}`,
    );
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(GAME_SUBCATEGORY_CONFIG));
  },
};
