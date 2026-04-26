// src/controller/entities/character-class/character-class-controller.ts
// Layer 3 organism — mounts JSON API routes and HTML page routes for CharacterClass.

import { Elysia, t } from "elysia";
import { CharacterClassService } from "@model-service/entities/character-class";
import { CHARACTER_CLASS_CONFIG } from "@config/entities/character-class";
import {
  errorHandlerPlugin,
  authenticatePlugin,
  makeAuthorizeMiddleware,
  validateRequestPlugin,
} from "../../atoms/middleware";
import { createCrudRoutes } from "../../molecules/crud-routes";
import { deriveBodySchema, paginationQuerySchema } from "../../sub-atoms/schema";
import { CharacterClassPages } from "./character-class-pages";

const TAGS = ["Character Classes"];
const passthroughKeys = CHARACTER_CLASS_CONFIG.nonColumnKeys ?? [];
const alwaysOptionalKeys = ["is_active"];
const bodySchema = deriveBodySchema(CHARACTER_CLASS_CONFIG.fields, "create", passthroughKeys, alwaysOptionalKeys);

const CharacterClassApi = new Elysia()
  .use(errorHandlerPlugin)
  .use(authenticatePlugin)
  .use(makeAuthorizeMiddleware(CHARACTER_CLASS_CONFIG.permissions))
  .use(validateRequestPlugin)
  .get("/api/character-classes/check-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return CharacterClassService.checkNameAvailable(
      q["name"] ?? "",
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({ name: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .get("/api/character-classes/check-machine-name", async ({ query }) => {
    const q = query as Record<string, string>;
    return CharacterClassService.checkMachineNameAvailable(
      q["machineName"] ?? "",
      q["excludeId"] || undefined,
    );
  }, {
    query: t.Object({ machineName: t.String(), excludeId: t.Optional(t.String()) }),
    detail: { tags: TAGS },
  })
  .use(createCrudRoutes("/api/character-classes", CharacterClassService, {
    createSchema: bodySchema,
    updateSchema: deriveBodySchema(CHARACTER_CLASS_CONFIG.fields, "update", passthroughKeys),
    querySchema: paginationQuerySchema,
    tags: TAGS,
  }));

export const CharacterClassController = new Elysia()
  .use(CharacterClassApi)
  .use(CharacterClassPages);
