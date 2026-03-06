// src/view-service/entities/game-subdomain/game-subdomain-view-service.ts
// Layer 4 organism — complete view preparation interface for GameSubdomain

import { GAME_SUBDOMAIN_CONFIG } from "@config/entities/game-subdomain";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta, ReferenceLookup } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";

/**
 * Pre-binds GAME_SUBDOMAIN_CONFIG so callers never import config directly.
 * Form methods accept domainOptions — the list of GameDomains for the dropdown.
 * List/detail methods accept a referenceLookup to resolve domain UUIDs to names.
 */
export const GameSubdomainViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, GAME_SUBDOMAIN_CONFIG, referenceLookup, pagination);
  },

  prepareDetailView(
    entity: Record<string, unknown>,
    referenceLookup?: ReferenceLookup,
  ): DetailView {
    return buildDetailView(entity, GAME_SUBDOMAIN_CONFIG, referenceLookup);
  },

  prepareCreateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(GAME_SUBDOMAIN_CONFIG, values, errors, selectOptions);
  },

  prepareEditForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    return buildFormView(GAME_SUBDOMAIN_CONFIG, currentValues, errors, selectOptions);
  },

  prepareDuplicateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    sourceValues: Record<string, unknown>,
  ): FormView {
    return buildFormView(
      GAME_SUBDOMAIN_CONFIG, sourceValues, undefined, selectOptions,
      `Duplicate ${GAME_SUBDOMAIN_CONFIG.displayName}`,
    );
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(GAME_SUBDOMAIN_CONFIG));
  },
};
