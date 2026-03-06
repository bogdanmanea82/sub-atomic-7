// src/controller/molecules/crud-routes.ts
// Wires all CRUD handler factories into a prefixed Elysia route group

import { Elysia } from "elysia";
import type { EntityService } from "../sub-atoms/types";

import {
  makeCreateHandler,
  makeGetByIdHandler,
  makeGetAllHandler,
  makeUpdateHandler,
  makeDeleteHandler,
} from "../atoms/handlers";

/**
 * Creates a complete set of CRUD routes for any entity.
 * Pass any service that satisfies EntityService<TEntity> and a URL prefix.
 * Returns an Elysia instance ready to be mounted with .use()
 */
export function createCrudRoutes<TEntity>(
  prefix: string,
  service: EntityService<TEntity>
) {
  return new Elysia({ prefix })
    .get("/", makeGetAllHandler(service))
    .get("/:id", makeGetByIdHandler(service))
    .post("/", makeCreateHandler(service))
    .put("/:id", makeUpdateHandler(service))
    .delete("/:id", makeDeleteHandler(service));
}
