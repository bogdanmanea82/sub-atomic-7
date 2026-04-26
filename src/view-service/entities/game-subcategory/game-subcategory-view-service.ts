// src/view-service/entities/game-subcategory/game-subcategory-view-service.ts
// Layer 4 organism — complete view preparation interface for GameSubcategory

import { GAME_SUBCATEGORY_CONFIG } from "@config/entities/game-subcategory";
import { GAME_DOMAIN_REF_FIELD_ATOM, GAME_SUBDOMAIN_REF_FIELD_ATOM, GAME_CATEGORY_REF_FIELD_ATOM } from "@config/universal/atoms";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta, ReferenceLookup } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig, buildFilteredListView } from "../../molecules/views";
import { buildStatusFormExtension } from "../../sub-atoms";

/**
 * Pre-binds GAME_SUBCATEGORY_CONFIG so callers never import config directly.
 * Form methods accept three sets of options for the cascading dropdowns.
 * List/detail methods accept a referenceLookup to resolve all three parent UUIDs.
 */
/** Fields excluded from filtered list view — shown as filter dropdowns instead */
const LIST_EXCLUDE_FIELDS = new Set<string>([GAME_DOMAIN_REF_FIELD_ATOM, GAME_SUBDOMAIN_REF_FIELD_ATOM, GAME_CATEGORY_REF_FIELD_ATOM].map((f) => f.name));

export const GameSubcategoryViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, GAME_SUBCATEGORY_CONFIG, referenceLookup, pagination);
  },

  prepareFilteredListView(
    entities: Record<string, unknown>[],
    pagination?: PaginationMeta,
    referenceLookup?: ReferenceLookup,
  ): ListView {
    const view = buildListView(entities, GAME_SUBCATEGORY_CONFIG, referenceLookup, pagination);
    return buildFilteredListView(view, LIST_EXCLUDE_FIELDS);
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
    const base = buildFormView(GAME_SUBCATEGORY_CONFIG, values, errors, selectOptions);
    return { ...base, ...buildStatusFormExtension(values) };
  },

  prepareEditForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    const base = buildFormView(GAME_SUBCATEGORY_CONFIG, currentValues, errors, selectOptions);
    return { ...base, ...buildStatusFormExtension(currentValues) };
  },

  prepareDuplicateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    sourceValues: Record<string, unknown>,
  ): FormView {
    const base = buildFormView(
      GAME_SUBCATEGORY_CONFIG, sourceValues, undefined, selectOptions,
      `Duplicate ${GAME_SUBCATEGORY_CONFIG.displayName}`,
    );
    return { ...base, currentState: "active" };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(GAME_SUBCATEGORY_CONFIG));
  },
};
