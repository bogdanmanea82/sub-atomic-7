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
import { makeCheckNameHandler } from "../../atoms/handlers";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameSubcategoryPages } from "./game-subcategory-pages";

const GameSubcategoryApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_SUBCATEGORY_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-subcategories/check-name", makeCheckNameHandler(
    GameSubcategoryService, "gameCategoryId", "game_category_id",
  ))
  .use(createCrudRoutes("/api/game-subcategories", GameSubcategoryService));

export const GameSubcategoryController = new Elysia()
  .use(GameSubcategoryApi)
  .use(GameSubcategoryPages);
