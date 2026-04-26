// src/controller/entities/item/item-controller.ts
// Layer 3 organism — mounts JSON API routes and HTML page routes for Item.

import { Elysia, t } from "elysia";
import { ItemService } from "@model-service/entities/item";
import { ITEM_CONFIG } from "@config/entities/item";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { ItemPages } from "./item-pages";

const TAGS = ["Items"];
const passthroughKeys = ITEM_CONFIG.nonColumnKeys ?? [];
const bodySchema = deriveBodySchema(ITEM_CONFIG.fields, "create", passthroughKeys);

const ItemApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(ITEM_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/items/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return ItemService.checkNameAvailable(q["name"] ?? "", q["excludeId"] || undefined);
  }, {
    query: t.Object({ name: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .get("/api/items/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return ItemService.checkMachineNameAvailable(q["machineName"] ?? "", q["excludeId"] || undefined);
  }, {
    query: t.Object({ machineName: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/items", ItemService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(ITEM_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }));

export const ItemController = new Elysia()
  .use(ItemApi)
  .use(ItemPages);
