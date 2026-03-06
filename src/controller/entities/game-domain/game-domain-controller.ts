// src/controller/entities/game-domain/game-domain-controller.ts
// Layer 3 organism — registers all GameDomain HTTP routes with middleware

import { Elysia } from "elysia";
import { GameDomainService } from "@model-service/entities/game-domain";
import { errorHandlerPlugin, validateRequestPlugin } from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";

/**
 * Complete HTTP controller for GameDomain.
 * Mounts error handling, request validation, and all CRUD routes.
 * Layer 3 depends only on Layer 2 (GameDomainService) — never on Layer 1 directly.
 */
export const GameDomainController = new Elysia()
  .use(errorHandlerPlugin)
  .use(validateRequestPlugin)
  .use(createCrudRoutes("/game-domains", GameDomainService));
