// src/controller/entities/game-subdomain/game-subdomain-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameSubdomain

import { Elysia, t } from "elysia";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GAME_SUBDOMAIN_CONFIG } from "@config/entities/game-subdomain";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { makeCheckNameHandler } from "../../atoms/handlers";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { GameSubdomainPages } from "./game-subdomain-pages";

const TAGS = ["Game Subdomains"];
const bodySchema = deriveBodySchema(GAME_SUBDOMAIN_CONFIG.fields);
const checkNameQuerySchema = t.Object({
  name: t.String(),
  gameDomainId: t.Optional(t.String()),
  excludeId: t.Optional(t.String()),
});

const GameSubdomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_SUBDOMAIN_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-subdomains/check-name", makeCheckNameHandler(
    GameSubdomainService, "gameDomainId", "game_domain_id",
  ), {
    query: checkNameQuerySchema,
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/game-subdomains", GameSubdomainService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(GAME_SUBDOMAIN_CONFIG.fields, "update"),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }));

/**
 * Complete GameSubdomain controller — mounts API and browser-facing page routes.
 */
export const GameSubdomainController = new Elysia()
  .use(GameSubdomainApi)
  .use(GameSubdomainPages);
