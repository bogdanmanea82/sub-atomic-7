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
import { makeCheckNameHandler } from "../../atoms/handlers";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameSubdomainPages } from "./game-subdomain-pages";

const GameSubdomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(GAME_SUBDOMAIN_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/game-subdomains/check-name", makeCheckNameHandler(
    GameSubdomainService, "gameDomainId", "game_domain_id",
  ))
  .use(createCrudRoutes("/api/game-subdomains", GameSubdomainService));

/**
 * Complete GameSubdomain controller — mounts API and browser-facing page routes.
 */
export const GameSubdomainController = new Elysia()
  .use(GameSubdomainApi)
  .use(GameSubdomainPages);
