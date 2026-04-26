// src/controller/entities/game-domain/game-domain-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameDomain

import { Elysia, t } from "elysia";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { GameDomainPages } from "./game-domain-pages";

const TAGS = ["Game Domains"];
const passthroughKeys = GAME_DOMAIN_CONFIG.nonColumnKeys ?? [];
const alwaysOptionalKeys = ["is_active"];
const bodySchema = deriveBodySchema(GAME_DOMAIN_CONFIG.fields, "create", passthroughKeys, alwaysOptionalKeys);

const GameDomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_DOMAIN_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-domains/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return GameDomainService.checkNameAvailable(
      q["name"] ?? "",
      undefined,
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({ name: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .get("/api/game-domains/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return GameDomainService.checkMachineNameAvailable(
      q["machineName"] ?? "",
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({ machineName: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/game-domains", GameDomainService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(GAME_DOMAIN_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }));

/**
 * Complete GameDomain controller — mounts API and browser-facing page routes.
 * Pages use authenticatePlugin for user context but handle auth per-route
 * (GET pages are public, POST actions check permissions via the API layer).
 */
export const GameDomainController = new Elysia()
  .use(GameDomainApi)
  .use(GameDomainPages);
