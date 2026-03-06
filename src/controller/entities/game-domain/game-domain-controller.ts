// src/controller/entities/game-domain/game-domain-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameDomain

import { Elysia } from "elysia";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameDomainPages } from "./game-domain-pages";

/**
 * JSON API at /api/game-domains — consumed by Layer 6 fetch() calls.
 * authenticatePlugin derives the user from the Authorization header.
 * makeAuthorizeMiddleware enforces Layer 0 permissions per HTTP method.
 * validateRequestPlugin enforces application/json content-type.
 * The check-name route is registered before CRUD so /:id doesn't swallow it.
 */
const GameDomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_DOMAIN_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-domains/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    const name = q["name"] ?? "";
    const excludeId = q["excludeId"] ?? "";
    if (name.trim() === "") {
      return { available: false };
    }
    const result = await GameDomainService.findMany({ name });
    if (!result.success) {
      return { available: false };
    }
    // When editing, exclude the current record — keeping your own name is fine
    const conflicts = excludeId
      ? result.data.filter((d) => (d as unknown as { id: string }).id !== excludeId)
      : result.data;
    return { available: conflicts.length === 0 };
  })
  .use(createCrudRoutes("/api/game-domains", GameDomainService));

/**
 * Complete GameDomain controller — mounts API and browser-facing page routes.
 * Pages use authenticatePlugin for user context but handle auth per-route
 * (GET pages are public, POST actions check permissions via the API layer).
 */
export const GameDomainController = new Elysia()
  .use(GameDomainApi)
  .use(GameDomainPages);
