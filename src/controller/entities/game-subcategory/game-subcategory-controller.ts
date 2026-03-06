// src/controller/entities/game-subcategory/game-subcategory-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameSubcategory

import { Elysia } from "elysia";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { GAME_SUBCATEGORY_CONFIG } from "@config/entities/game-subcategory";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameSubcategoryPages } from "./game-subcategory-pages";

/**
 * JSON API at /api/game-subcategories.
 * The check-name route accepts game_category_id to scope uniqueness.
 */
const GameSubcategoryApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_SUBCATEGORY_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-subcategories/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const name = q["name"] ?? "";
    const gameCategoryId = q["gameCategoryId"] ?? "";
    const excludeId = q["excludeId"] ?? "";
    if (name.trim() === "" || gameCategoryId.trim() === "") {
      return { available: false };
    }
    const result = await GameSubcategoryService.findMany({
      name,
      game_category_id: gameCategoryId,
    });
    if (!result.success) {
      return { available: false };
    }
    const conflicts = excludeId
      ? result.data.filter((d) => (d as unknown as { id: string }).id !== excludeId)
      : result.data;
    return { available: conflicts.length === 0 };
  })
  .use(createCrudRoutes("/api/game-subcategories", GameSubcategoryService));

export const GameSubcategoryController = new Elysia()
  .use(GameSubcategoryApi)
  .use(GameSubcategoryPages);
