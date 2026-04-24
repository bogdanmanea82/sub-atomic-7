// src/controller/entities/game-category/game-category-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameCategory

import { Elysia, t } from "elysia";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GAME_CATEGORY_CONFIG } from "@config/entities/game-category";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { makeCheckNameHandler } from "../../atoms/handlers";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { GameCategoryPages } from "./game-category-pages";

const TAGS = ["Game Categories"];
const bodySchema = deriveBodySchema(GAME_CATEGORY_CONFIG.fields);
const checkNameQuerySchema = t.Object({
  name: t.String(),
  gameSubdomainId: t.Optional(t.String()),
  excludeId: t.Optional(t.String()),
});

const GameCategoryApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_CATEGORY_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-categories/check-name", makeCheckNameHandler(
    GameCategoryService, "gameSubdomainId", "game_subdomain_id",
  ), {
    query: checkNameQuerySchema,
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/game-categories", GameCategoryService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(GAME_CATEGORY_CONFIG.fields, "update"),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }));

/**
 * Complete GameCategory controller — mounts API and browser-facing page routes.
 */
export const GameCategoryController = new Elysia()
  .use(GameCategoryApi)
  .use(GameCategoryPages);
