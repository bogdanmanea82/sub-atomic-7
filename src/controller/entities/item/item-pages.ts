// src/controller/entities/item/item-pages.ts
// HTML page routes for Item — server-rendered views for the browser.
// Item has both hierarchy cascade dropdowns (like ItemModifier) and
// a stat sheet (like CharacterClass). All stats are shown; zeros are
// filtered by the service before insert.

import { Elysia } from "elysia";
import { ItemService } from "@model-service/entities/item";
import { StatService } from "@model-service/entities/stat";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { ItemViewService } from "@view-service/entities/item";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/item";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { fetchOptions, buildReferenceLookup, buildCascadingOptions } from "../../sub-atoms/options";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/items";
const FIELD_CONFIG_JSON = ItemViewService.prepareBrowserFieldConfig();

export const ItemPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const params = query as Record<string, string>;
    const pagination = extractPagination(params);

    const filterDomainId      = params["game_domain_id"]      || undefined;
    const filterSubdomainId   = params["game_subdomain_id"]   || undefined;
    const filterCategoryId    = params["game_category_id"]    || undefined;
    const filterSubcategoryId = params["game_subcategory_id"] || undefined;

    const conditions: Record<string, unknown> = {};
    if (filterDomainId)      conditions["game_domain_id"]      = filterDomainId;
    if (filterSubdomainId)   conditions["game_subdomain_id"]   = filterSubdomainId;
    if (filterCategoryId)    conditions["game_category_id"]    = filterCategoryId;
    if (filterSubcategoryId) conditions["game_subcategory_id"] = filterSubcategoryId;
    const hasConditions = Object.keys(conditions).length > 0;

    const [result, { domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }] = await Promise.all([
      ItemService.findManyPaginated(pagination, hasConditions ? conditions : undefined),
      buildCascadingOptions({ domainId: filterDomainId, subdomainId: filterSubdomainId, categoryId: filterCategoryId }),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;

    const referenceLookup = buildReferenceLookup([
      { fieldName: "game_domain_id",      options: domainOptions },
      { fieldName: "game_subdomain_id",   options: subdomainOptions },
      { fieldName: "game_category_id",    options: categoryOptions },
      { fieldName: "game_subcategory_id", options: subcategoryOptions },
    ]);

    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = ItemViewService.prepareFilteredListView(
      result.data as unknown as Record<string, unknown>[],
      paginationMeta,
      referenceLookup,
    );

    const filterOptions = { domainOptions, subdomainOptions, categoryOptions, subcategoryOptions };
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
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statsResult] = await Promise.all([
      buildCascadingOptions({}),
      StatService.findMany(),
    ]);
    const allStats = statsResult.success ? statsResult.data as unknown as Record<string, unknown>[] : [];
    const view = ItemViewService.prepareCreateForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions, game_subcategory_id: subcategoryOptions },
      allStats,
    );
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const [result, domainOptions, subdomainOptions, categoryOptions, subcategoryOptions] = await Promise.all([
      ItemService.findById(params["id"]),
      fetchOptions(GameDomainService),
      fetchOptions(GameSubdomainService),
      fetchOptions(GameCategoryService),
      fetchOptions(GameSubcategoryService),
    ]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const referenceLookup = buildReferenceLookup([
      { fieldName: "game_domain_id",      options: domainOptions },
      { fieldName: "game_subdomain_id",   options: subdomainOptions },
      { fieldName: "game_category_id",    options: categoryOptions },
      { fieldName: "game_subcategory_id", options: subcategoryOptions },
    ]);
    const view = ItemViewService.prepareDetailView(
      result.data as unknown as Record<string, unknown>,
      referenceLookup,
    );
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await ItemService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const domainId    = entity["game_domain_id"]    as string;
    const subdomainId = entity["game_subdomain_id"] as string;
    const categoryId  = entity["game_category_id"]  as string;
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statsResult] = await Promise.all([
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      StatService.findMany(),
    ]);
    const allStats = statsResult.success ? statsResult.data as unknown as Record<string, unknown>[] : [];
    const view = ItemViewService.prepareEditForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions, game_subcategory_id: subcategoryOptions },
      entity,
      allStats,
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ─────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await ItemService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const entity = result.data as unknown as Record<string, unknown>;
    const domainId    = entity["game_domain_id"]    as string;
    const subdomainId = entity["game_subdomain_id"] as string;
    const categoryId  = entity["game_category_id"]  as string;
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statsResult] = await Promise.all([
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      StatService.findMany(),
    ]);
    const allStats = statsResult.success ? statsResult.data as unknown as Record<string, unknown>[] : [];
    const view = ItemViewService.prepareDuplicateForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions, game_subcategory_id: subcategoryOptions },
      entity,
      allStats,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ──────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set, redirect }) => {
    const input = body as Record<string, unknown>;
    const result = await ItemService.create(input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${(result.data as { id: string }).id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId    = input["game_domain_id"]    as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const categoryId  = input["game_category_id"]  as string | undefined;
    const [{ domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statsResult] = await Promise.all([
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      StatService.findMany(),
    ]);
    const allStats = statsResult.success ? statsResult.data as unknown as Record<string, unknown>[] : [];
    const view = ItemViewService.prepareCreateForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions, game_subcategory_id: subcategoryOptions },
      allStats,
      input,
      errors,
    );
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set, redirect }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await ItemService.update(id, input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainId    = input["game_domain_id"]    as string | undefined;
    const subdomainId = input["game_subdomain_id"] as string | undefined;
    const categoryId  = input["game_category_id"]  as string | undefined;
    const [findResult, { domainOptions, subdomainOptions, categoryOptions, subcategoryOptions }, statsResult] = await Promise.all([
      ItemService.findById(id),
      buildCascadingOptions({ domainId, subdomainId, categoryId }),
      StatService.findMany(),
    ]);
    const savedEntity = findResult.success ? findResult.data as unknown as Record<string, unknown> : {};
    const allStats = statsResult.success ? statsResult.data as unknown as Record<string, unknown>[] : [];
    const view = ItemViewService.prepareEditForm(
      { game_domain_id: domainOptions, game_subdomain_id: subdomainOptions, game_category_id: categoryOptions, game_subcategory_id: subcategoryOptions },
      savedEntity,
      allStats,
      input,
      errors,
    );
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, redirect }) => {
    await ItemService.delete(params["id"]);
    return redirect(BASE_PATH);
  });
