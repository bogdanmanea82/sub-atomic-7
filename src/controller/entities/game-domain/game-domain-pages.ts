// src/controller/entities/game-domain/game-domain-pages.ts
// HTML page routes for GameDomain — server-rendered views for the browser

import { Elysia } from "elysia";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameDomainViewService } from "@view-service/entities/game-domain";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
} from "@view/entities/game-domain";
import { errorHandlerPlugin } from "../../atoms/middleware";

const BASE_PATH = "/game-domains";

/** Sets the response content-type to HTML. */
function setHtml(headers: Record<string, string | number>): void {
  headers["content-type"] = "text/html; charset=utf-8";
}

/**
 * Server-rendered HTML routes for GameDomain.
 * POST routes redirect on success — the browser follows the redirect and reloads.
 * GET /game-domains/new must be declared before GET /:id or Elysia matches "new" as an ID.
 */
export const GameDomainPages = new Elysia()
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ set }) => {
    setHtml(set.headers);
    const result = await GameDomainService.findMany();
    if (!result.success) return `<p>Error loading records.</p>`;
    const view = GameDomainViewService.prepareListView(
      result.data as unknown as Record<string, unknown>[],
    );
    return listPage(view, BASE_PATH);
  })

  // ── Create form (before /:id) ────────────────────────────────────────────
  .get(`${BASE_PATH}/new`, ({ set }) => {
    setHtml(set.headers);
    const view = GameDomainViewService.prepareCreateForm();
    return createPage(view, BASE_PATH);
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
    return editPage(view, params["id"], BASE_PATH);
  })

  // ── Create action ─────────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set }) => {
    const result = await GameDomainService.create(
      body as Record<string, unknown>,
    );
    if (result.success) {
      set.redirect = `${BASE_PATH}/${(result.data as { id: string }).id}`;
      return;
    }
    // Validation failed — re-render form
    setHtml(set.headers);
    set.status = 422;
    const view = GameDomainViewService.prepareCreateForm();
    return createPage(view, BASE_PATH);
  })

  // ── Update action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set }) => {
    const id = params["id"];
    const result = await GameDomainService.update(
      id,
      body as Record<string, unknown>,
    );
    if (result.success) {
      set.redirect = `${BASE_PATH}/${id}`;
      return;
    }
    set.redirect = `${BASE_PATH}/${id}/edit`;
    return;
  })

  // ── Delete action ─────────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, set }) => {
    await GameDomainService.delete(params["id"]);
    set.redirect = BASE_PATH;
    return;
  });
