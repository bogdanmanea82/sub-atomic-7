// src/controller/entities/stat/stat-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for Stat.

import { Elysia, t } from "elysia";
import { StatService } from "@model-service/entities/stat";
import { STAT_CONFIG } from "@config/entities/stat";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { StatPages } from "./stat-pages";

const TAGS = ["Stats"];
const passthroughKeys = STAT_CONFIG.nonColumnKeys ?? [];
const alwaysOptionalKeys = ["is_active"];
const bodySchema = deriveBodySchema(STAT_CONFIG.fields, "create", passthroughKeys, alwaysOptionalKeys);

const StatApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(STAT_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/stats/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return StatService.checkNameAvailable(
      q["name"] ?? "",
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({ name: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .get("/api/stats/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return StatService.checkMachineNameAvailable(
      q["machineName"] ?? "",
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({ machineName: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/stats", StatService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(STAT_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }));

export const StatController = new Elysia()
  .use(StatApi)
  .use(StatPages);
