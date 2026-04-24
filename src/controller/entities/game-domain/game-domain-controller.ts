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
const bodySchema = deriveBodySchema(GAME_DOMAIN_CONFIG.fields);

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
  .use(createCrudRoutes("/api/game-domains", GameDomainService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(GAME_DOMAIN_CONFIG.fields, "update"),
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
