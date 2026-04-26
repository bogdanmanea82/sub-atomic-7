// src/controller/entities/character-class/character-class-pages.ts
// HTML page routes for CharacterClass — server-rendered views for the browser.
// The stat sheet (character_stat_base rows) is fetched alongside the entity and
// passed to the view service. On create, all stats are fetched to populate defaults.

import { Elysia } from "elysia";
import { CharacterClassService } from "@model-service/entities/character-class";
import { StatService } from "@model-service/entities/stat";
import { CharacterClassViewService } from "@view-service/entities/character-class";
import {
  listPage,
  detailPage,
  createPage,
  editPage,
  duplicatePage,
} from "@view/entities/character-class";
import { errorHandlerPlugin } from "../../atoms/middleware";
import { extractPagination } from "../../sub-atoms/request";
import { setHtml } from "../../sub-atoms/response";
import { buildPaginationMeta } from "@view-service/sub-atoms/pagination";

const BASE_PATH = "/character-classes";
const FIELD_CONFIG_JSON = CharacterClassViewService.prepareBrowserFieldConfig();

export const CharacterClassPages = new Elysia({ detail: { hide: true } })
  .use(errorHandlerPlugin)

  // ── List ────────────────────────────────────────────────────────────────
  .get(BASE_PATH, async ({ query, set }) => {
    setHtml(set.headers);
    const pagination = extractPagination(query as Record<string, string>);
    const result = await CharacterClassService.findManyPaginated(pagination);
    if (!result.success) return `<p>Error loading records.</p>`;
    const paginationMeta = buildPaginationMeta(result.totalCount, pagination.page, pagination.pageSize);
    const view = CharacterClassViewService.prepareListView(
      result.data as unknown as Record<string, unknown>[],
      undefined,
      paginationMeta,
    );
    return listPage(view, BASE_PATH);
  })

  // ── Create form (before /:id) ──────────────────────────────────────────
  .get(`${BASE_PATH}/new`, async ({ set }) => {
    setHtml(set.headers);
    const statsResult = await StatService.findMany();
    const allStats = statsResult.success ? statsResult.data as unknown as Record<string, unknown>[] : [];
    const view = CharacterClassViewService.prepareCreateForm(allStats);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Detail ─────────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await CharacterClassService.findById(params["id"]);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 500;
      return `<p>${result.error}</p>`;
    }
    const view = CharacterClassViewService.prepareDetailView(
      result.data as unknown as Record<string, unknown>,
    );
    return detailPage(view, params["id"], BASE_PATH);
  })

  // ── Edit form ──────────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/edit`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await CharacterClassService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const view = CharacterClassViewService.prepareEditForm(
      result.data as unknown as Record<string, unknown>,
    );
    return editPage(view, params["id"], BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Duplicate form ─────────────────────────────────────────────────────
  .get(`${BASE_PATH}/:id/duplicate`, async ({ params, set }) => {
    setHtml(set.headers);
    const result = await CharacterClassService.findById(params["id"]);
    if (!result.success) {
      set.status = 404;
      return `<p>Record not found.</p>`;
    }
    const view = CharacterClassViewService.prepareDuplicateForm(
      result.data as unknown as Record<string, unknown>,
    );
    return duplicatePage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Create action ──────────────────────────────────────────────────────
  .post(BASE_PATH, async ({ body, set, redirect }) => {
    const input = body as Record<string, unknown>;
    const result = await CharacterClassService.create(input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${(result.data as { id: string }).id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const statsResult = await StatService.findMany();
    const allStats = statsResult.success ? statsResult.data as unknown as Record<string, unknown>[] : [];
    const view = CharacterClassViewService.prepareCreateForm(allStats, input, errors);
    return createPage(view, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Update action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id`, async ({ params, body, set, redirect }) => {
    const id = params["id"];
    const input = body as Record<string, unknown>;
    const result = await CharacterClassService.update(id, input);
    if (result.success) {
      return redirect(`${BASE_PATH}/${id}`);
    }
    setHtml(set.headers);
    set.status = 422;
    const errors = result.stage === "validation" ? result.errors : undefined;
    const findResult = await CharacterClassService.findById(id);
    const characterData = findResult.success ? findResult.data as unknown as Record<string, unknown> : {};
    const view = CharacterClassViewService.prepareEditForm(characterData, input, errors);
    return editPage(view, id, BASE_PATH, FIELD_CONFIG_JSON);
  })

  // ── Delete action ──────────────────────────────────────────────────────
  .post(`${BASE_PATH}/:id/delete`, async ({ params, redirect }) => {
    await CharacterClassService.delete(params["id"]);
    return redirect(BASE_PATH);
  });
