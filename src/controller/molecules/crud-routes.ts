// src/controller/molecules/crud-routes.ts
// Wires all CRUD handler factories into a prefixed Elysia route group

import { Elysia, t } from "elysia";
import type { EntityService } from "../sub-atoms/types";

import {
  makeCreateHandler,
  makeGetByIdHandler,
  makeGetAllHandler,
  makeUpdateHandler,
  makeDeleteHandler,
} from "../atoms/handlers";

interface CrudRouteOptions {
  createSchema?: ReturnType<typeof t.Object>;
  updateSchema?: ReturnType<typeof t.Object>;
  querySchema?: ReturnType<typeof t.Object>;
  tags?: string[];
}

/**
 * Creates a complete set of CRUD routes for any entity.
 * Pass any service that satisfies EntityService<TEntity> and a URL prefix.
 * Optional schemas are derived from Layer 0 config and passed here for Elysia's
 * runtime validation and OpenAPI documentation generation.
 * Returns an Elysia instance ready to be mounted with .use()
 */
export function createCrudRoutes<TEntity>(
  prefix: string,
  service: EntityService<TEntity>,
  options?: CrudRouteOptions,
) {
  const detail = options?.tags ? { tags: options.tags } : undefined;

  return new Elysia({ prefix })
    .get("/", makeGetAllHandler(service), {
      query: options?.querySchema,
      detail,
    })
    .get("/:id", makeGetByIdHandler(service), { detail })
    .post("/", makeCreateHandler(service), {
      body: options?.createSchema,
      detail,
    })
    .put("/:id", makeUpdateHandler(service), {
      body: options?.updateSchema,
      detail,
    })
    .delete("/:id", makeDeleteHandler(service), { detail });
}
