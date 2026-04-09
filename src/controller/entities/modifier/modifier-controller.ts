// src/controller/entities/modifier/modifier-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for Modifier

import { Elysia } from "elysia";
import { ModifierService } from "@model-service/entities/modifier";
import { MODIFIER_CONFIG } from "@config/entities/modifier";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { makeCheckFieldHandler } from "../../atoms/handlers";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { ModifierPages } from "./modifier-pages";
import { ModifierBindingApi } from "./modifier-binding-api";
import { ModifierTierApi } from "./modifier-tier-api";

const ModifierApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(MODIFIER_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/modifiers/check-name", makeCheckFieldHandler(
    ModifierService, "name", "gameSubcategoryId", "game_subcategory_id",
  ))
  .get("/api/modifiers/check-code", makeCheckFieldHandler(
    ModifierService, "code", "gameSubcategoryId", "game_subcategory_id",
  ))
  .use(createCrudRoutes("/api/modifiers", ModifierService))
  .use(ModifierBindingApi)
  .use(ModifierTierApi);

export const ModifierController = new Elysia()
  .use(ModifierApi)
  .use(ModifierPages);
