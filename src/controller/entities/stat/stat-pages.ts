// src/controller/entities/stat/stat-pages.ts
// HTML page routes for Stat — server-rendered views for the browser.
// Pages bridge Layer 3 (HTTP) with Layers 4–5 (presentation).

import { Elysia } from "elysia";
import { StatService } from "@model-service/entities/stat";
import { StatViewService } from "@view-service/entities/stat";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/stat";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/stats";
const FIELD_CONFIG_JSON = StatViewService.prepareBrowserFieldConfig();

export const StatPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const pagination = extractPagination(query as Record<string, string>);
    const result = await StatService.findManyPaginated(pagination);
    if (!result.success) return `<p>Error loading records.</p>`;
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = StatViewService.prepareListView(
      result.data as unknown as Record<string, unknown>[],
      paginationMeta,
    );
    return listPage(view, BASE_PATH);
  })

  // ── Create form (before /:id) ──────────────────────────────────────────
  .get(`${BASE_PATH}/new`, ({ set }) => {
    setHtml(set.headers);
    const view = StatViewService.prepareCreateForm();
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await StatService.findById(params["id"]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const view = StatViewService.prepareDetailView(
      result.data as unknown as Record<string, unknown>,
    );
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await StatService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const view = StatViewService.prepareEditForm(
      result.data as unknown as Record<string, unknown>,
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ─────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await StatService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const view = StatViewService.prepareDuplicateForm(
      result.data as unknown as Record<string, unknown>,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ──────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set }) => {
    const input = body as Record<string, unknown>;
    const result = await StatService.create(input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${(result.data as { id: string }).id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const view = StatViewService.prepareCreateForm(input, errors);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await StatService.update(id, input);
    if (result.success) {
      set.redirect = `${BASE_PATH}/${id}`;
      return;
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const view = StatViewService.prepareEditForm(input, errors);
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await StatService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
