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
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameCategoryPages } from "./game-category-pages";

/**
 * JSON API at /api/game-categories.
 * The check-name route accepts game_subdomain_id to scope uniqueness.
 */
const GameCategoryApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_CATEGORY_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-categories/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const name = q["name"] ?? "";
    const gameSubdomainId = q["gameSubdomainId"] ?? "";
    const excludeId = q["excludeId"] ?? "";
    if (name.trim() === "" || gameSubdomainId.trim() === "") {
      return { available: false };
    }
    const result = await GameCategoryService.findMany({
      name,
      game_subdomain_id: gameSubdomainId,
    });
    if (!result.success) {
      return { available: false };
    }
    const conflicts = excludeId
      ? result.data.filter((d) => (d as unknown as { id: string }).id !== excludeId)
      : result.data;
    return { available: conflicts.length === 0 };
  })
  .use(createCrudRoutes("/api/game-categories", GameCategoryService));

/**
 * Complete GameCategory controller — mounts API and browser-facing page routes.
 */
export const GameCategoryController = new Elysia()
  .use(GameCategoryApi)
  .use(GameCategoryPages);
