// src/controller/entities/game-domain/game-domain-controller.ts
// Layer 3 organism — mounts both JSON API routes and HTML page routes for GameDomain

import { Elysia } from "elysia";
import { GameDomainService } from "@model-service/entities/game-domain";
import {
  errorHandlerPlugin,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { GameDomainPages } from "./game-domain-pages";

/**
 * JSON API at /api/game-domains — consumed by Layer 6 fetch() calls.
 * validateRequestPlugin enforces application/json content-type.
 */
const GameDomainApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(validateRequestPlugin)
  .use(createCrudRoutes("/api/game-domains", GameDomainService));

/**
 * Complete GameDomain controller — mounts API and browser-facing page routes.
 */
export const GameDomainController = new Elysia()
  .use(GameDomainApi)
  .use(GameDomainPages);
