// src/controller/entities/game-subcategory/game-subcategory-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameSubcategory

import { Elysia, t } from "elysia";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { GAME_SUBCATEGORY_CONFIG } from "@config/entities/game-subcategory";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { GameSubcategoryPages } from "./game-subcategory-pages";

const TAGS = ["Game Subcategories"];
const passthroughKeys = GAME_SUBCATEGORY_CONFIG.nonColumnKeys ?? [];
const alwaysOptionalKeys = ["is_active"];
const bodySchema = deriveBodySchema(GAME_SUBCATEGORY_CONFIG.fields, "create", passthroughKeys, alwaysOptionalKeys);

const GameSubcategoryApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_SUBCATEGORY_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-subcategories/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const scopeId = q["gameCategoryId"] ?? "";
    return GameSubcategoryService.checkNameAvailable(
      q["name"] ?? "",
      scopeId ? { game_category_id: scopeId } : undefined,
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({
      name: t.String(),
      gameCategoryId: t.Optional(t.String()),
      excludeId: t.Optional(t.String()),
    }),
    detail: { tags: TAGS },
  })
  .get("/api/game-subcategories/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return GameSubcategoryService.checkMachineNameAvailable(
      q["machineName"] ?? "",
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({ machineName: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/game-subcategories", GameSubcategoryService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(GAME_SUBCATEGORY_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }));

export const GameSubcategoryController = new Elysia()
  .use(GameSubcategoryApi)
  .use(GameSubcategoryPages);
