// src/controller/entities/game-category/game-category-pages.ts
// HTML page routes for GameCategory — server-rendered views for the browser.
// Form pages fetch both GameDomains and GameSubdomains to populate cascading dropdowns.

import { Elysia } from "elysia";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryViewService } from "@view-service/entities/game-category";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/game-category";
import type { CategoryFilterOptions } from "@view/entities/game-category";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { fetchOptions, buildReferenceLookup, buildCascadingOptions } from "../../sub-atoms/options";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/game-categories";
const FIELD_CONFIG_JSON = GameCategoryViewService.prepareBrowserFieldConfig();

export const GameCategoryPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const params = query as Record<string, string>;
    const pagination = extractPagination(params);

    const filterDomainId = params["game_domain_id"] || undefined;
    const filterSubdomainId = params["game_subdomain_id"] || undefined;
    const conditions: Record<string, unknown> = {};
    if (filterDomainId) conditions["game_domain_id"] = filterDomainId;
    if (filterSubdomainId) conditions["game_subdomain_id"] = filterSubdomainId;
    const hasConditions = Object.keys(conditions).length > 0;

    const [result, { domainOptions, subdomainOptions }] = await Promise.all([
      GameCategoryService.findManyPaginated(pagination, hasConditions ? conditions : undefined),
      buildCascadingOptions({ domainId: filterDomainId }),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;

    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = GameCategoryViewService.prepareFilteredListView(
      result.data as unknown as Record<string, unknown>[],
      paginationMeta,
    );
    const filterOptions: CategoryFilterOptions = { domainOptions, subdomainOptions };
    const filterValues = {
      game_domain_id: filterDomainId,
      game_subdomain_id: filterSubdomainId,
    };
    return listPage(view, BASE_PATH, filterOptions, filterValues);
  })

  // ── Create form (before /:id) ──────────────────────────────────────────
  .get(`${BASE_PATH}/new`, async ({ set }) => {
    setHtml(set.headers);
    // No parent IDs yet — domain options only; subdomain populated via cascade on domain select
    const { domainOptions, subdomainOptions } = await buildCascadingOptions({});
    const view = GameCategoryViewService.prepareCreateForm({ game_domain_id: domainOptions, game_subdomain_id: subdomainOptions });
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const [result, domainOptions, subdomainOptions] = await Promise.all([
      GameCategoryService.findById(params["id"]),
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService),
    ]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const lookup = buildReferenceLookup([
      { fieldName: "game_domain_id", options: domainOptions },
      { fieldName: "game_subdomain_id", options: subdomainOptions },
    ]);
    const view = GameCategoryViewService.prepareDetailView(
      result.data as unknown as Record<string, unknown>,
      lookup,
    );
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameCategoryService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const domainId = entity["game_domain_id"] as string;
    const { domainOptions, subdomainOptions } = await buildCascadingOptions({ domainId });
    const view = GameCategoryViewService.prepareEditForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions },
      entity,
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ─────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameCategoryService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const domainId = entity["game_domain_id"] as string;
    const { domainOptions, subdomainOptions } = await buildCascadingOptions({ domainId });
    const view = GameCategoryViewService.prepareDuplicateForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions },
      entity,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ──────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set }) => {
    const input = body as Record<string, unknown>;
    const result = await GameCategoryService.create(input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${(result.data as { id: string }).id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const { domainOptions, subdomainOptions } = await buildCascadingOptions({ domainId });
    const view = GameCategoryViewService.prepareCreateForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions }, input, errors,
    );
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await GameCategoryService.update(id, input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const { domainOptions, subdomainOptions } = await buildCascadingOptions({ domainId });
    const view = GameCategoryViewService.prepareEditForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions }, input, errors,
    );
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await GameCategoryService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
