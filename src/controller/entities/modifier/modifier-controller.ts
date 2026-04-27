// src/controller/entities/item-modifie./modifier-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for Modifier

import { Elysia, t } from "elysia";
import { ModifierService } from "@model-service/entities/modifier";
import { MODIFIER_CONFIG } from "@config/entities/modifier";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { ItemModifierPages } from "./modifier-pages";
import { ItemModifierBindingApi } from "./modifier-binding-api";
import { ItemModifierTierApi } from "./modifier-tier-api";

const TAGS = ["Item Modifiers"];
const passthroughKeys = MODIFIER_CONFIG.nonColumnKeys ?? [];
// is_active is always set by applyStatusAction() from status_action — browser never sends it directly
const alwaysOptionalKeys = ["is_active"];
const bodySchema = deriveBodySchema(MODIFIER_CONFIG.fields, "create", passthroughKeys, alwaysOptionalKeys);

const ModifierApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(MODIFIER_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/modifiers/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const scopeId = q["gameSubcategoryId"] ?? "";
    return ModifierService.checkFieldAvailable(
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
  .get("/api/modifiers/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const scopeId = q["gameSubcategoryId"] ?? "";
    return ModifierService.checkFieldAvailable(
      "machine_name",
      q["machineName"] ?? "",
      scopeId ? { game_subcategory_id: scopeId } : undefined,
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({
      machineName: t.String(),
      gameSubcategoryId: t.Optional(t.String()),
      excludeId: t.Optional(t.String()),
    }),
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/modifiers", ModifierService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(MODIFIER_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }))
  .use(ItemModifierBindingApi)
  .use(ItemModifierTierApi);

export const ModifierController = new Elysia()
  .use(ModifierApi)
  .use(ItemModifierPages);
