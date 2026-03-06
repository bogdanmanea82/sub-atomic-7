// src/controller/entities/game-category/game-category-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameCategory

import { Elysia } from "elysia";
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
import { GameCategoryPages } from "./game-category-pages";

const GameCategoryApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_CATEGORY_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-categories/check-name", makeCheckNameHandler(
    GameCategoryService, "gameSubdomainId", "game_subdomain_id",
  ))
  .use(createCrudRoutes("/api/game-categories", GameCategoryService));

/**
 * Complete GameCategory controller — mounts API and browser-facing page routes.
 */
export const GameCategoryController = new Elysia()
  .use(GameCategoryApi)
  .use(GameCategoryPages);
