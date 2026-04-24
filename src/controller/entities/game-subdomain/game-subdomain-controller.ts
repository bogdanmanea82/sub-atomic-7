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
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { GameSubdomainPages } from "./game-subdomain-pages";

const TAGS = ["Game Subdomains"];
const bodySchema = deriveBodySchema(GAME_SUBDOMAIN_CONFIG.fields);

const GameSubdomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_SUBDOMAIN_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-subdomains/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const scopeId = q["gameDomainId"] ?? "";
    return GameSubdomainService.checkNameAvailable(
      q["name"] ?? "",
      scopeId ? { game_domain_id: scopeId } : undefined,
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({
      name: t.String(),
      gameDomainId: t.Optional(t.String()),
      excludeId: t.Optional(t.String()),
    }),
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
