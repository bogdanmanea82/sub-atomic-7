// src/controller/entities/item-modifier/item-modifier-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for ItemModifier

import { Elysia, t } from "elysia";
import { ItemModifierService } from "@model-service/entities/item-modifier";
import { ITEM_MODIFIER_CONFIG } from "@config/entities/item-modifier";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { ItemModifierPages } from "./item-modifier-pages";
import { ItemModifierBindingApi } from "./item-modifier-binding-api";
import { ItemModifierTierApi } from "./item-modifier-tier-api";

const TAGS = ["Item Modifiers"];
const bodySchema = deriveBodySchema(ITEM_MODIFIER_CONFIG.fields);

const ModifierApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(ITEM_MODIFIER_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/modifiers/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const scopeId = q["gameSubcategoryId"] ?? "";
    return ItemModifierService.checkFieldAvailable(
      "name",
      q["name"] ?? "",
      scopeId ? { game_subcategory_id: scopeId } : undefined,
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({
      name: t.String(),
      gameSubcategoryId: t.Optional(t.String()),
      excludeId: t.Optional(t.String()),
    }),
    detail: { tags: TAGS },
  })
  .get("/api/modifiers/check-code", async ({ query }) => {
    const q = query as Record<string, string>;
    const scopeId = q["gameSubcategoryId"] ?? "";
    return ItemModifierService.checkFieldAvailable(
      "code",
      q["code"] ?? "",
      scopeId ? { game_subcategory_id: scopeId } : undefined,
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({
      code: t.String(),
      gameSubcategoryId: t.Optional(t.String()),
      excludeId: t.Optional(t.String()),
    }),
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/modifiers", ItemModifierService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(ITEM_MODIFIER_CONFIG.fields, "update"),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }))
  .use(ItemModifierBindingApi)
  .use(ItemModifierTierApi);

export const ItemModifierController = new Elysia()
  .use(ModifierApi)
  .use(ItemModifierPages);
