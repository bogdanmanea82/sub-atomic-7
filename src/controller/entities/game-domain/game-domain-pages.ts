// src/controller/entities/game-domain/game-domain-pages.ts
// HTML page routes for GameDomain — server-rendered views for the browser.
//
// Pages files bridge Layer 3 (HTTP) with Layers 4-5 (presentation).
// They import from View Service and View — this is by design.
// The "downward only" rule applies to the Config→Model→Service vertical.
// Pages are horizontal orchestrators that legitimately span Layers 3-5.

import { Elysia } from "elysia";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameDomainViewService } from "@view-service/entities/game-domain";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/game-domain";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/game-domains";
const FIELD_CONFIG_JSON = GameDomainViewService.prepareBrowserFieldConfig();

/**
 * Server-rendered HTML routes for GameDomain.
 * POST routes redirect on success — the browser follows the redirect and reloads.
 * GET /game-domains/new must be declared before GET /:id or Elysia matches "new" as an ID.
 */
export const GameDomainPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const pagination = extractPagination(query as Record<string, string>);
    const result = await GameDomainService.findManyPaginated(pagination);
    if (!result.success) return `<p>Error loading records.</p>`;
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = GameDomainViewService.prepareListView(
      result.data as unknown as Record<string, unknown>[],
      paginationMeta,
    );
    return listPage(view, BASE_PATH);
  })

  // ── Create form (before /:id) ────────────────────────────────────────────
  .get(`${BASE_PATH}/new`, ({ set }) => {
    setHtml(set.headers);
    const view = GameDomainViewService.prepareCreateForm();
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ───────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameDomainService.findById(params["id"]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const view = GameDomainViewService.prepareDetailView(
      result.data as unknown as Record<string, unknown>,
    );
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameDomainService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const view = GameDomainViewService.prepareEditForm(
      result.data as unknown as Record<string, unknown>,
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await GameDomainService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const view = GameDomainViewService.prepareDuplicateForm(
      result.data as unknown as Record<string, unknown>,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ─────────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set }) => {
    const input = body as Record<string, unknown>;
    const result = await GameDomainService.create(input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${(result.data as { id: string }).id}`;
      return;
    }
    // Validation failed — re-render form with submitted values and errors
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const view = GameDomainViewService.prepareCreateForm(input, errors);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await GameDomainService.update(id, input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${id}`;
      return;
    }
    // Validation failed — re-render edit form with submitted values and errors
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const view = GameDomainViewService.prepareEditForm(input, errors);
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await GameDomainService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
