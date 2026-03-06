// src/view-service/entities/game-subcategory/game-subcategory-view-service.ts
// Layer 4 organism — complete view preparation interface for GameSubcategory

import { GAME_SUBCATEGORY_CONFIG } from "@config/entities/game-subcategory";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta } from "../../types";
import type { ReferenceLookup } from "../../atoms/field-display";
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
    domainOptions: readonly SelectOption[],
    subdomainOptions: readonly SelectOption[],
    categoryOptions: readonly SelectOption[],
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(
      GAME_SUBCATEGORY_CONFIG,
      values,
      errors,
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
      },
    );
  },

  prepareEditForm(
    domainOptions: readonly SelectOption[],
    subdomainOptions: readonly SelectOption[],
    categoryOptions: readonly SelectOption[],
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(
      GAME_SUBCATEGORY_CONFIG,
      currentValues,
      errors,
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
      },
    );
  },

  prepareDuplicateForm(
    domainOptions: readonly SelectOption[],
    subdomainOptions: readonly SelectOption[],
    categoryOptions: readonly SelectOption[],
    sourceValues: Record<string, unknown>,
  ): FormView {
    const view = buildFormView(
      GAME_SUBCATEGORY_CONFIG,
      sourceValues,
      undefined,
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
      },
    );
    return { ...view, title: `Duplicate ${GAME_SUBCATEGORY_CONFIG.displayName}` };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(GAME_SUBCATEGORY_CONFIG));
  },
};
