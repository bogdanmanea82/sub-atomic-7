// src/controller/entities/game-subdomain/game-subdomain-pages.ts
// HTML page routes for GameSubdomain — server-rendered views for the browser.
// Form pages fetch all GameDomains to populate the parent dropdown.

import { Elysia } from "elysia";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainViewService } from "@view-service/entities/game-subdomain";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/game-subdomain";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";
import type { SelectOption } from "@view-service/types";
import type { ReferenceLookup } from "@view-service/atoms/field-display";

const BASE_PATH = "/game-subdomains";
const FIELD_CONFIG_JSON = GameSubdomainViewService.prepareBrowserFieldConfig();

/** Sets the response content-type to HTML. */
function setHtml(headers: Record<string, string | number>): void {
  headers["content-type"] = "text/html; charset=utf-8";
}

/**
 * Fetches all active GameDomains and returns them as SelectOption[].
 * Used to populate the parent domain dropdown on form pages.
 */
async function getDomainOptions(): Promise<readonly SelectOption[]> {
  const result = await GameDomainService.findMany();
  if (!result.success) return [];
  return result.data.map((d) => ({
    label: (d as unknown as { name: string }).name,
    value: (d as unknown as { id: string }).id,
  }));
}

/**
 * Builds a ReferenceLookup from domain options so list/detail views
 * can resolve game_domain_id UUIDs to human-readable domain names.
 */
function buildDomainLookup(options: readonly SelectOption[]): ReferenceLookup {
  const map: Record<string, string> = {};
  for (const opt of options) {
    map[opt.value] = opt.label;
  }
  return { game_domain_id: map };
}

export const GameSubdomainPages = new Elysia()
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const pagination = extractPagination(query as Record<string, string>);
    const [result, domainOptions] = await Promise.all([
      GameSubdomainService.findManyPaginated(pagination),
      getDomainOptions(),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;
    const lookup = buildDomainLookup(domainOptions);
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = GameSubdomainViewService.prepareListView(
      result.data as unknown as Record<string, unknown>[],
      lookup,
      paginationMeta,
    );
    return listPage(view, BASE_PATH);
  })

  // ── Create form (before /:id) ────────────────────────────────────────────
  .get(`${BASE_PATH}/new`, async ({ set }) => {
    setHtml(set.headers);
    const domainOptions = await getDomainOptions();
    const view = GameSubdomainViewService.prepareCreateForm(domainOptions);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ───────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const [result, domainOptions] = await Promise.all([
      GameSubdomainService.findById(params["id"]),
      getDomainOptions(),
    ]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const lookup = buildDomainLookup(domainOptions);
    const view = GameSubdomainViewService.prepareDetailView(
      result.data as unknown as Record<string, unknown>,
      lookup,
    );
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameSubdomainService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const domainOptions = await getDomainOptions();
    const view = GameSubdomainViewService.prepareEditForm(
      domainOptions,
      result.data as unknown as Record<string, unknown>,
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameSubdomainService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const domainOptions = await getDomainOptions();
    const view = GameSubdomainViewService.prepareDuplicateForm(
      domainOptions,
      result.data as unknown as Record<string, unknown>,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ─────────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set }) => {
    const input = body as Record<string, unknown>;
    const result = await GameSubdomainService.create(input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${(result.data as { id: string }).id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainOptions = await getDomainOptions();
    const view = GameSubdomainViewService.prepareCreateForm(domainOptions, input, errors);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await GameSubdomainService.update(id, input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const domainOptions = await getDomainOptions();
    const view = GameSubdomainViewService.prepareEditForm(domainOptions, input, errors);
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await GameSubdomainService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
