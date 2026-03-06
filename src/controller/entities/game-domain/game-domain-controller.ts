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
import { makeCheckNameHandler } from "../../atoms/handlers";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameDomainPages } from "./game-domain-pages";

const GameDomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_DOMAIN_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-domains/check-name", makeCheckNameHandler(GameDomainService))
  .use(createCrudRoutes("/api/game-domains", GameDomainService));

/**
 * Complete GameDomain controller — mounts API and browser-facing page routes.
 * Pages use authenticatePlugin for user context but handle auth per-route
 * (GET pages are public, POST actions check permissions via the API layer).
 */
export const GameDomainController = new Elysia()
  .use(GameDomainApi)
  .use(GameDomainPages);
