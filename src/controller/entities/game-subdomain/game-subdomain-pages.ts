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
import type { SubdomainFilterOptions } from "@view/entities/game-subdomain";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { fetchOptions, buildReferenceLookup, buildCascadingOptions } from "../../sub-atoms/options";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/game-subdomains";
const FIELD_CONFIG_JSON = GameSubdomainViewService.prepareBrowserFieldConfig();

export const GameSubdomainPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const params = query as Record<string, string>;
    const pagination = extractPagination(params);

    const filterDomainId = params["game_domain_id"] || undefined;
    const conditions: Record<string, unknown> = {};
    if (filterDomainId) conditions["game_domain_id"] = filterDomainId;
    const hasConditions = Object.keys(conditions).length > 0;

    const [result, { domainOptions }] = await Promise.all([
      GameSubdomainService.findManyPaginated(pagination, hasConditions ? conditions : undefined),
      buildCascadingOptions({}),
    ]);
    if (!result.success) return `<p>Error loading records.</p>`;

    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = GameSubdomainViewService.prepareFilteredListView(
      result.data as unknown as Record<string, unknown>[],
      paginationMeta,
    );
    const filterOptions: SubdomainFilterOptions = { domainOptions };
    const filterValues = { game_domain_id: filterDomainId };
    return listPage(view, BASE_PATH, filterOptions, filterValues);
  })

  // ── Create form (before /:id) ────────────────────────────────────────────
  .get(`${BASE_PATH}/new`, async ({ set }) => {
    setHtml(set.headers);
    const { domainOptions } = await buildCascadingOptions({});
    const view = GameSubdomainViewService.prepareCreateForm({ game_domain_id: domainOptions });
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ───────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const [result, domainOptions] = await Promise.all([
      GameSubdomainService.findById(params["id"]),
      fetchOptions(GameDomainService),
    ]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const lookup = buildReferenceLookup([{ fieldName: "game_domain_id", options: domainOptions }]);
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
    const { domainOptions } = await buildCascadingOptions({});
    const view = GameSubdomainViewService.prepareEditForm(
      { game_domain_id: domainOptions },
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
    const { domainOptions } = await buildCascadingOptions({});
    const view = GameSubdomainViewService.prepareDuplicateForm(
      { game_domain_id: domainOptions },
      result.data as unknown as Record<string, unknown>,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ─────────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set, redirect }) => {
    const input = body as Record<string, unknown>;
    const result = await GameSubdomainService.create(input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${(result.data as { id: string }).id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const { domainOptions } = await buildCascadingOptions({});
    const view = GameSubdomainViewService.prepareCreateForm({ game_domain_id: domainOptions }, input, errors);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set, redirect }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await GameSubdomainService.update(id, input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const { domainOptions } = await buildCascadingOptions({});
    const view = GameSubdomainViewService.prepareEditForm({ game_domain_id: domainOptions }, input, errors);
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, redirect }) => {
    await GameSubdomainService.delete(params["id"]);
    return redirect(BASE_PATH);
  });
