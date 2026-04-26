// src/view-service/entities/game-subdomain/game-subdomain-view-service.ts
// Layer 4 organism — complete view preparation interface for GameSubdomain

import { GAME_SUBDOMAIN_CONFIG } from "@config/entities/game-subdomain";
import { GAME_DOMAIN_REF_FIELD_ATOM } from "@config/universal/atoms";
import type { ListView, DetailView, FormView, SelectOption, PaginationMeta, ReferenceLookup } from "../../types";
import { buildListView, buildDetailView, buildFormView, buildBrowserFieldConfig } from "../../molecules/views";
import { deriveCurrentState } from "../../sub-atoms";

/**
 * Pre-binds GAME_SUBDOMAIN_CONFIG so callers never import config directly.
 * Form methods accept domainOptions — the list of GameDomains for the dropdown.
 * List/detail methods accept a referenceLookup to resolve domain UUIDs to names.
 */
/** Fields excluded from filtered list view — shown as filter dropdown instead */
const LIST_EXCLUDE_FIELDS = new Set<string>([GAME_DOMAIN_REF_FIELD_ATOM].map((f) => f.name));

export const GameSubdomainViewService = {
  prepareListView(
    entities: Record<string, unknown>[],
    referenceLookup?: ReferenceLookup,
    pagination?: PaginationMeta,
  ): ListView {
    return buildListView(entities, GAME_SUBDOMAIN_CONFIG, referenceLookup, pagination);
  },

  prepareFilteredListView(
    entities: Record<string, unknown>[],
    pagination?: PaginationMeta,
    referenceLookup?: ReferenceLookup,
  ): ListView {
    const view = buildListView(entities, GAME_SUBDOMAIN_CONFIG, referenceLookup, pagination);
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
  ): DetailView {
    return buildDetailView(entity, GAME_SUBDOMAIN_CONFIG, referenceLookup);
  },

  prepareCreateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    values?: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    const base = buildFormView(GAME_SUBDOMAIN_CONFIG, values, errors, selectOptions);
    return { ...base, currentState: deriveCurrentState(values), statusReason: String(values?.["archived_reason"] ?? "") || undefined };
  },

  prepareEditForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    currentValues: Record<string, unknown>,
    errors?: Record<string, string>,
  ): FormView {
    const base = buildFormView(GAME_SUBDOMAIN_CONFIG, currentValues, errors, selectOptions);
    return { ...base, currentState: deriveCurrentState(currentValues), statusReason: String(currentValues["archived_reason"] ?? "") || undefined };
  },

  prepareDuplicateForm(
    selectOptions: Record<string, readonly SelectOption[]>,
    sourceValues: Record<string, unknown>,
  ): FormView {
    const base = buildFormView(
      GAME_SUBDOMAIN_CONFIG, sourceValues, undefined, selectOptions,
      `Duplicate ${GAME_SUBDOMAIN_CONFIG.displayName}`,
    );
    return { ...base, currentState: "active" };
  },

  prepareBrowserFieldConfig(): string {
    return JSON.stringify(buildBrowserFieldConfig(GAME_SUBDOMAIN_CONFIG));
  },
};
