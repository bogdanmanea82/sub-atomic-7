// src/controller/entities/game-subcategory/game-subcategory-pages.ts
// HTML page routes for GameSubcategory — server-rendered views for the browser.
// Form pages fetch GameDomains, GameSubdomains, and GameCategories for cascading dropdowns.

import { Elysia } from "elysia";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameSubcategoryViewService } from "@view-service/entities/game-subcategory";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/game-subcategory";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { fetchOptions, buildReferenceLookup } from "../../sub-atoms/options";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/game-subcategories";
const FIELD_CONFIG_JSON = GameSubcategoryViewService.prepareBrowserFieldConfig();

export const GameSubcategoryPages = new Elysia()
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const pagination = extractPagination(query as Record<string, string>);
    const [result, domainOptions, subdomainOptions, categoryOptions] = await Promise.all([
      GameSubcategoryService.findManyPaginated(pagination),
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService),
      fetchOptions(GameCategoryService),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;
    const lookup = buildReferenceLookup([
      { fieldName: "game_domain_id", options: domainOptions },
      { fieldName: "game_subdomain_id", options: subdomainOptions },
      { fieldName: "game_category_id", options: categoryOptions },
    ]);
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = GameSubcategoryViewService.prepareListView(
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
    const view = GameSubcategoryViewService.prepareCreateForm(
      { game_domain_id: domainOptions, game_subdomain_id: [], game_category_id: [] },
    );
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const [result, domainOptions, subdomainOptions, categoryOptions] = await Promise.all([
      GameSubcategoryService.findById(params["id"]),
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService),
      fetchOptions(GameCategoryService),
    ]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const lookup = buildReferenceLookup([
      { fieldName: "game_domain_id", options: domainOptions },
      { fieldName: "game_subdomain_id", options: subdomainOptions },
      { fieldName: "game_category_id", options: categoryOptions },
    ]);
    const view = GameSubcategoryViewService.prepareDetailView(
      result.data as unknown as Record<string, unknown>,
      lookup,
    );
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameSubcategoryService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const domainId = entity["game_domain_id"] as string;
    const subdomainId = entity["game_subdomain_id"] as string;
    const [domainOptions, subdomainOptions, categoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService, { game_domain_id: domainId }),
      fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }),
    ]);
    const view = GameSubcategoryViewService.prepareEditForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions },
      entity,
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ─────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameSubcategoryService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const domainId = entity["game_domain_id"] as string;
    const subdomainId = entity["game_subdomain_id"] as string;
    const [domainOptions, subdomainOptions, categoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService, { game_domain_id: domainId }),
      fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }),
    ]);
    const view = GameSubcategoryViewService.prepareDuplicateForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions },
      entity,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ──────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set }) => {
    const input = body as Record<string, unknown>;
    const result = await GameSubcategoryService.create(input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${(result.data as { id: string }).id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const [domainOptions, subdomainOptions, categoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      domainId ? fetchOptions(GameSubdomainService, { game_domain_id: domainId }) : Promise.resolve([]),
      subdomainId ? fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }) : Promise.resolve([]),
    ]);
    const view = GameSubcategoryViewService.prepareCreateForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions },
      input, errors,
    );
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await GameSubcategoryService.update(id, input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId = input["game_domain_id"] as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const [domainOptions, subdomainOptions, categoryOptions] = await Promise.all([
      fetchOptions(GameDomainService),
      domainId ? fetchOptions(GameSubdomainService, { game_domain_id: domainId }) : Promise.resolve([]),
      subdomainId ? fetchOptions(GameCategoryService, { game_subdomain_id: subdomainId }) : Promise.resolve([]),
    ]);
    const view = GameSubcategoryViewService.prepareEditForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions },
      input, errors,
    );
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await GameSubcategoryService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
