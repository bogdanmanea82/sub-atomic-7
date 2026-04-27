// src/controller/entities/item-modifie./modifier-pages.ts
// HTML page routes for Modifier — server-rendered views for the browser.
// Phase 2: tier data flows through all form and detail routes.

import { Elysia } from "elysia";
import { ModifierService, ItemModifierBindingService } from "@model-service/entities/modifier";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { StatService } from "@model-service/entities/stat";
import {
  ModifierViewService,
  ModifierBindingViewService,
  ModifierAssignmentViewService,
} from "@view-service/entities/modifier";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/modifier";
import type { ItemModifierFilterOptions } from "@view/entities/modifier";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { fetchOptions, buildReferenceLookup, buildCascadingOptions } from "../../sub-atoms/options";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/modifiers";
const FIELD_CONFIG_JSON = ModifierViewService.prepareBrowserFieldConfig();

export const ItemModifierPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const params = query as Record<string, string>;
    const pagination = extractPagination(params);

    // Extract filter values from query params
    const filterDomainId = params["game_domain_id"] || undefined;
    const filterSubdomainId = params["game_subdomain_id"] || undefined;
    const filterCategoryId = params["game_category_id"] || undefined;
    const filterSubcategoryId = params["game_subcategory_id"] || undefined;

    // Build conditions for the query
    const conditions: Record<string, unknown> = {};
    if (filterDomainId) conditions["game_domain_id"] = filterDomainId;
    if (filterSubdomainId) conditions["game_subdomain_id"] = filterSubdomainId;
    if (filterCategoryId) conditions["game_category_id"] = filterCategoryId;
    if (filterSubcategoryId) conditions["game_subcategory_id"] = filterSubcategoryId;
    const hasConditions = Object.keys(conditions).length > 0;

    const [result, { domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statOptions] = await Promise.all([
      ModifierService.findManyPaginated(pagination, hasConditions ? conditions : undefined),
      buildCascadingOptions({ domainId: filterDomainId, subdomainId: filterSubdomainId, categoryId: filterCategoryId }),
      fetchOptions(StatService),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;

    const referenceLookup = buildReferenceLookup([
      { fieldName: "target_stat_id", options: statOptions },
    ]);

    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = ModifierViewService.prepareFilteredListView(
      result.data as unknown as Record<string, unknown>[],
      paginationMeta,
      referenceLookup,
    );

    const filterOptions: ItemModifierFilterOptions = {
      domainOptions, subdomainOptions, categoryOptions, subcategoryOptions,
    };
    const filterValues = {
      game_domain_id: filterDomainId,
      game_subdomain_id: filterSubdomainId,
      game_category_id: filterCategoryId,
      game_subcategory_id: filterSubcategoryId,
    };
    return listPage(view, BASE_PATH, filterOptions, filterValues);
  })

  // ── Create form ────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/new`, async ({ set }) => {
    setHtml(set.headers);
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statOptions] = await Promise.all([
      buildCascadingOptions({}),
      fetchOptions(StatService),
    ]);
    const view = ModifierViewService.prepareCreateForm({
      game_domain_id: domainOptions,
      game_subdomain_id: subdomainOptions,
      game_category_id: categoryOptions,
      game_subcategory_id: subcategoryOptions,
      target_stat_id: statOptions,
    });
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  // Fetches ALL options unfiltered — needed to resolve UUIDs to names in the
  // reference lookup and to drive the Assignments panel category list.
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const modifierId = params["id"];
    const [result, bindings, domainOptions, subdomainOptions, categoryOptions, subcategoryOptions, allSubcatsResult, statOptions] = await Promise.all([
      ModifierService.findById(modifierId),
      ItemModifierBindingService.findByModifier(modifierId),
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService),
      fetchOptions(GameCategoryService),
      fetchOptions(GameSubcategoryService),
      GameSubcategoryService.findMany(),
      fetchOptions(StatService),
    ]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const lookup = buildReferenceLookup([
      { fieldName: "game_domain_id", options: domainOptions },
      { fieldName: "game_subdomain_id", options: subdomainOptions },
      { fieldName: "game_category_id", options: categoryOptions },
      { fieldName: "game_subcategory_id", options: subcategoryOptions },
      { fieldName: "target_stat_id", options: statOptions },
    ]);
    const categoryLookup = Object.fromEntries(categoryOptions.map((o) => [o.value, o.label]));
    const subcategoryLookup = Object.fromEntries(subcategoryOptions.map((o) => [o.value, o.label]));
    const entity = result.data as unknown as Record<string, unknown>;
    const tiers = (result.data.tiers ?? []) as unknown as Record<string, unknown>[];
    const base = ModifierViewService.prepareDetailView(entity, lookup, tiers);
    const categoryBindings = ModifierBindingViewService.preparePanel(
      bindings.category as unknown as Record<string, unknown>[],
      categoryLookup, subcategoryLookup,
    );
    const subcategoryBindings = ModifierBindingViewService.preparePanel(
      bindings.subcategory as unknown as Record<string, unknown>[],
      categoryLookup, subcategoryLookup,
    );
    // Compute resolved assignments for Screen 3
    const allCategories = categoryOptions.map((o) => ({ id: o.value, name: o.label }));
    const allSubcats = allSubcatsResult.success
      ? (allSubcatsResult.data as unknown as { id: string; name: string; game_category_id: string }[])
      : [];
    const assignments = ModifierAssignmentViewService.preparePanel(
      bindings.category as unknown as Record<string, unknown>[],
      bindings.subcategory as unknown as Record<string, unknown>[],
      allCategories, allSubcats,
    );
    const isActive = entity["is_active"] === true;
    const archivedAt = entity["archived_at"] instanceof Date ? String(entity["archived_at"]) : undefined;
    const archivedReason = entity["archived_reason"] != null ? String(entity["archived_reason"]) : undefined;
    const view = { ...base, categoryBindings, subcategoryBindings, assignments, isActive, archivedAt, archivedReason };
    return detailPage(view, modifierId, BASE_PATH);
  })

  // ── Edit form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const modifierId = params["id"];
    const [result, bindings] = await Promise.all([
      ModifierService.findById(modifierId),
      ItemModifierBindingService.findByModifier(modifierId),
    ]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const tiers = (result.data.tiers ?? []) as unknown as Record<string, unknown>[];
    const domainId = entity["game_domain_id"] as string;
    const subdomainId = entity["game_subdomain_id"] as string;
    const categoryId = entity["game_category_id"] as string;
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, allCatOptions, allSubcatsResult, statOptions] = await Promise.all([
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      fetchOptions(GameCategoryService),
      GameSubcategoryService.findMany(),
      fetchOptions(StatService),
    ]);
    const categoryLookup = Object.fromEntries(categoryOptions.map((o) => [o.value, o.label]));
    const subcategoryLookup = Object.fromEntries(subcategoryOptions.map((o) => [o.value, o.label]));
    const base = ModifierViewService.prepareEditForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
        target_stat_id: statOptions,
      },
      entity,
      undefined,
      ModifierViewService.tiersToFormRows(tiers),
    );
    const categoryBindings = ModifierBindingViewService.preparePanel(
      bindings.category as unknown as Record<string, unknown>[],
      categoryLookup, subcategoryLookup,
    );
    const subcategoryBindings = ModifierBindingViewService.preparePanel(
      bindings.subcategory as unknown as Record<string, unknown>[],
      categoryLookup, subcategoryLookup,
    );
    // Compute resolved assignments for Screen 3
    const allCategories = allCatOptions.map((o) => ({ id: o.value, name: o.label }));
    const allSubcats = allSubcatsResult.success
      ? (allSubcatsResult.data as unknown as { id: string; name: string; game_category_id: string }[])
      : [];
    const assignments = ModifierAssignmentViewService.preparePanel(
      bindings.category as unknown as Record<string, unknown>[],
      bindings.subcategory as unknown as Record<string, unknown>[],
      allCategories, allSubcats,
    );
    const archivedReason = entity["archived_reason"] != null ? String(entity["archived_reason"]) : undefined;
    const view = { ...base, categoryBindings, subcategoryBindings, assignments, archivedReason };
    return editPage(view, modifierId, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ─────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await ModifierService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const tiers = (result.data.tiers ?? []) as unknown as Record<string, unknown>[];
    const domainId = entity["game_domain_id"] as string;
    const subdomainId = entity["game_subdomain_id"] as string;
    const categoryId = entity["game_category_id"] as string;
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statOptions] = await Promise.all([
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      fetchOptions(StatService),
    ]);
    const view = ModifierViewService.prepareDuplicateForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
        target_stat_id: statOptions,
      },
      entity,
      ModifierViewService.tiersToFormRows(tiers),
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ──────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set, redirect }) => {
    const input = body as Record<string, unknown>;
    const result = await ModifierService.create(input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${(result.data as { id: string }).id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const categoryId = input["game_category_id"] as string | undefined;
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statOptions] = await Promise.all([
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      fetchOptions(StatService),
    ]);
    const tierRows = ModifierViewService.parseTiersJsonForRerender(input);
    const statusReason = typeof input["status_reason"] === "string" ? input["status_reason"] : undefined;
    const archivedReason = input["archived_reason"] != null ? String(input["archived_reason"]) : undefined;
    const base = ModifierViewService.prepareCreateForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
        target_stat_id: statOptions,
      },
      input, errors,
      tierRows.length > 0 ? tierRows : undefined,
    );
    return createPage({ ...base, statusReason, archivedReason }, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set, redirect }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const statusReason = typeof input["status_reason"] === "string" ? input["status_reason"] : undefined;
    const result = await ModifierService.update(id, input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const categoryId = input["game_category_id"] as string | undefined;
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statOptions] = await Promise.all([
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      fetchOptions(StatService),
    ]);
    const tierRows = ModifierViewService.parseTiersJsonForRerender(input);
    const archivedReason = input["archived_reason"] != null ? String(input["archived_reason"]) : undefined;
    const base = ModifierViewService.prepareEditForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
        target_stat_id: statOptions,
      },
      input, errors,
      tierRows.length > 0 ? tierRows : undefined,
    );
    return editPage({ ...base, statusReason, archivedReason }, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, redirect }) => {
    await ModifierService.delete(params["id"]);
    return redirect(BASE_PATH);
  });
