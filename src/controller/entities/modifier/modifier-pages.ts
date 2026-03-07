// src/controller/entities/modifier/modifier-pages.ts
// HTML page routes for Modifier — server-rendered views for the browser.
// Phase 2: tier data flows through all form and detail routes.

import { Elysia } from "elysia";
import { ModifierService } from "@model-service/entities/modifier";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { ModifierViewService } from "@view-service/entities/modifier";
import type { TierFormRow } from "@view-service/types";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/modifier";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { fetchOptions, buildReferenceLookup } from "../../sub-atoms/options";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/modifiers";
const FIELD_CONFIG_JSON = ModifierViewService.prepareBrowserFieldConfig();

/**
 * Converts tier records (from service findById) into form-compatible rows.
 */
function tiersToFormRows(tiers: readonly Record<string, unknown>[]): TierFormRow[] {
  return tiers.map((t) => ({
    tier_index: Number(t["tier_index"]),
    min_value: t["min_value"] != null ? Number(t["min_value"]) : null,
    max_value: t["max_value"] != null ? Number(t["max_value"]) : null,
    level_req: Number(t["level_req"]),
    spawn_weight: Number(t["spawn_weight"]),
  }));
}

/**
 * Parses tiers_json from POST body back into form rows for re-rendering on error.
 */
function parseTiersJsonForRerender(input: Record<string, unknown>): TierFormRow[] {
  const raw = input["tiers_json"];
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return tiersToFormRows(parsed);
  } catch {
    return [];
  }
}

export const ModifierPages = new Elysia()
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const pagination = extractPagination(query as Record<string, string>);
    const [result, domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
      ModifierService.findManyPaginated(pagination),
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService),
      fetchOptions(GameCategoryService),
      fetchOptions(GameSubcategoryService),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;
    const lookup = buildReferenceLookup([
      { fieldName: "game_domain_id", options: domainOptions },
      { fieldName: "game_subdomain_id", options: subdomainOptions },
      { fieldName: "game_category_id", options: categoryOptions },
      { fieldName: "game_subcategory_id", options: subcategoryOptions },
    ]);
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = ModifierViewService.prepareListView(
      result.data as unknown as Record<string, unknown>[],
      lookup,
      paginationMeta,
    );
    return listPage(view, BASE_PATH);
  })

  // ── Create form ────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/new`, async ({ set }) => {
    setHtml(set.headers);
    const domainOptions = await fetchOptions(GameDomainService);
    const view = ModifierViewService.prepareCreateForm({
      game_domain_id: domainOptions,
      game_subdomain_id: [],
      game_category_id: [],
      game_subcategory_id: [],
    });
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const [result, domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
      ModifierService.findById(params["id"]),
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService),
      fetchOptions(GameCategoryService),
      fetchOptions(GameSubcategoryService),
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
    ]);
    const entity = result.data as unknown as Record<string, unknown>;
    const tiers = (result.data.tiers ?? []) as unknown as Record<string, unknown>[];
    const view = ModifierViewService.prepareDetailView(entity, lookup, tiers);
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
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
    const [domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService, { game_domain_id: domainId }),
      fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }),
      fetchOptions(GameSubcategoryService, { game_category_id: categoryId }),
    ]);
    const view = ModifierViewService.prepareEditForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
      },
      entity,
      undefined,
      tiersToFormRows(tiers),
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
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
    const [domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService, { game_domain_id: domainId }),
      fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }),
      fetchOptions(GameSubcategoryService, { game_category_id: categoryId }),
    ]);
    const view = ModifierViewService.prepareDuplicateForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
      },
      entity,
      tiersToFormRows(tiers),
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ──────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set }) => {
    const input = body as Record<string, unknown>;
    const result = await ModifierService.create(input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${(result.data as { id: string }).id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const categoryId = input["game_category_id"] as string | undefined;
    const [domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      domainId ? fetchOptions(GameSubdomainService, { game_domain_id: domainId }) : Promise.resolve([]),
      subdomainId ? fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }) : Promise.resolve([]),
      categoryId ? fetchOptions(GameSubcategoryService, { game_category_id: categoryId }) : Promise.resolve([]),
    ]);
    const tierRows = parseTiersJsonForRerender(input);
    const view = ModifierViewService.prepareCreateForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
      },
      input, errors,
      tierRows.length > 0 ? tierRows : undefined,
    );
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await ModifierService.update(id, input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const categoryId = input["game_category_id"] as string | undefined;
    const [domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      domainId ? fetchOptions(GameSubdomainService, { game_domain_id: domainId }) : Promise.resolve([]),
      subdomainId ? fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }) : Promise.resolve([]),
      categoryId ? fetchOptions(GameSubcategoryService, { game_category_id: categoryId }) : Promise.resolve([]),
    ]);
    const tierRows = parseTiersJsonForRerender(input);
    const view = ModifierViewService.prepareEditForm(
      {
        game_domain_id: domainOptions,
        game_subdomain_id: subdomainOptions,
        game_category_id: categoryOptions,
        game_subcategory_id: subcategoryOptions,
      },
      input, errors,
      tierRows.length > 0 ? tierRows : undefined,
    );
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await ModifierService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
