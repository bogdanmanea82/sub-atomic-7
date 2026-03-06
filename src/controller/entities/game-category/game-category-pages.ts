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
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";
import type { SelectOption } from "@view-service/types";
import type { ReferenceLookup } from "@view-service/atoms/field-display";

const BASE_PATH = "/game-categories";
const FIELD_CONFIG_JSON = GameCategoryViewService.prepareBrowserFieldConfig();

/** Sets the response content-type to HTML. */
function setHtml(headers: Record<string, string | number>): void {
  headers["content-type"] = "text/html; charset=utf-8";
}

/** Fetches all GameDomains as SelectOption[]. */
async function getDomainOptions(): Promise<readonly SelectOption[]> {
  const result = await GameDomainService.findMany();
  if (!result.success) return [];
  return result.data.map((d) => ({
    label: (d as unknown as { name: string }).name,
    value: (d as unknown as { id: string }).id,
  }));
}

/** Fetches all GameSubdomains as SelectOption[]. */
async function getAllSubdomainOptions(): Promise<readonly SelectOption[]> {
  const result = await GameSubdomainService.findMany();
  if (!result.success) return [];
  return result.data.map((d) => ({
    label: (d as unknown as { name: string }).name,
    value: (d as unknown as { id: string }).id,
  }));
}

/** Fetches GameSubdomains filtered by a specific domain as SelectOption[]. */
async function getSubdomainOptionsForDomain(
  domainId: string,
): Promise<readonly SelectOption[]> {
  const result = await GameSubdomainService.findMany({ game_domain_id: domainId });
  if (!result.success) return [];
  return result.data.map((d) => ({
    label: (d as unknown as { name: string }).name,
    value: (d as unknown as { id: string }).id,
  }));
}

/**
 * Builds a ReferenceLookup that resolves both game_domain_id and game_subdomain_id
 * UUIDs to human-readable names for list and detail pages.
 */
function buildReferenceLookup(
  domainOptions: readonly SelectOption[],
  subdomainOptions: readonly SelectOption[],
): ReferenceLookup {
  const domainMap: Record<string, string> = {};
  for (const opt of domainOptions) domainMap[opt.value] = opt.label;

  const subdomainMap: Record<string, string> = {};
  for (const opt of subdomainOptions) subdomainMap[opt.value] = opt.label;

  return {
    game_domain_id: domainMap,
    game_subdomain_id: subdomainMap,
  };
}

export const GameCategoryPages = new Elysia()
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const pagination = extractPagination(query as Record<string, string>);
    const [result, domainOptions, subdomainOptions] = await Promise.all([
      GameCategoryService.findManyPaginated(pagination),
      getDomainOptions(),
      getAllSubdomainOptions(),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;
    const lookup = buildReferenceLookup(domainOptions, subdomainOptions);
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = GameCategoryViewService.prepareListView(
      result.data as unknown as Record<string, unknown>[],
      lookup,
      paginationMeta,
    );
    return listPage(view, BASE_PATH);
  })

  // ── Create form (before /:id) ──────────────────────────────────────────
  .get(`${BASE_PATH}/new`, async ({ set }) => {
    setHtml(set.headers);
    const domainOptions = await getDomainOptions();
    // Start with empty subdomain list — populated via cascade on domain selection
    const view = GameCategoryViewService.prepareCreateForm(domainOptions, []);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const [result, domainOptions, subdomainOptions] = await Promise.all([
      GameCategoryService.findById(params["id"]),
      getDomainOptions(),
      getAllSubdomainOptions(),
    ]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const lookup = buildReferenceLookup(domainOptions, subdomainOptions);
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
    const [domainOptions, subdomainOptions] = await Promise.all([
      getDomainOptions(),
      getSubdomainOptionsForDomain(domainId),
    ]);
    const view = GameCategoryViewService.prepareEditForm(
      domainOptions,
      subdomainOptions,
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
    const [domainOptions, subdomainOptions] = await Promise.all([
      getDomainOptions(),
      getSubdomainOptionsForDomain(domainId),
    ]);
    const view = GameCategoryViewService.prepareDuplicateForm(
      domainOptions,
      subdomainOptions,
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
    const [domainOptions, subdomainOptions] = await Promise.all([
      getDomainOptions(),
      domainId ? getSubdomainOptionsForDomain(domainId) : Promise.resolve([]),
    ]);
    const view = GameCategoryViewService.prepareCreateForm(domainOptions, subdomainOptions, input, errors);
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
    const [domainOptions, subdomainOptions] = await Promise.all([
      getDomainOptions(),
      domainId ? getSubdomainOptionsForDomain(domainId) : Promise.resolve([]),
    ]);
    const view = GameCategoryViewService.prepareEditForm(domainOptions, subdomainOptions, input, errors);
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await GameCategoryService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
