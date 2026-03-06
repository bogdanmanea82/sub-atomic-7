// src/controller/entities/game-subdomain/game-subdomain-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameSubdomain

import { Elysia } from "elysia";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GAME_SUBDOMAIN_CONFIG } from "@config/entities/game-subdomain";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameSubdomainPages } from "./game-subdomain-pages";

/**
 * JSON API at /api/game-subdomains.
 * The check-name route accepts game_domain_id to scope uniqueness.
 */
const GameSubdomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_SUBDOMAIN_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-subdomains/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const name = q["name"] ?? "";
    const gameDomainId = q["gameDomainId"] ?? "";
    const excludeId = q["excludeId"] ?? "";
    if (name.trim() === "" || gameDomainId.trim() === "") {
      return { available: false };
    }
    const result = await GameSubdomainService.findMany({
      name,
      game_domain_id: gameDomainId,
    });
    if (!result.success) {
      return { available: false };
    }
    const conflicts = excludeId
      ? result.data.filter((d) => (d as unknown as { id: string }).id !== excludeId)
      : result.data;
    return { available: conflicts.length === 0 };
  })
  .use(createCrudRoutes("/api/game-subdomains", GameSubdomainService));

/**
 * Complete GameSubdomain controller — mounts API and browser-facing page routes.
 */
export const GameSubdomainController = new Elysia()
  .use(GameSubdomainApi)
  .use(GameSubdomainPages);
