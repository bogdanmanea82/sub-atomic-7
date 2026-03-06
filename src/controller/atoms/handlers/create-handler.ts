// src/controller/atoms/handlers/create-handler.ts
// Factory — returns a POST handler bound to the given service

import type { Context } from "elysia";
import type { EntityService } from "../../sub-atoms/types";
import { parseBody } from "../../sub-atoms/request";
import { formatSuccess, formatError } from "../../sub-atoms/response";

/**
 * Returns a handler that creates an entity using the provided service.
 * Pass any Layer 2 service that satisfies EntityService<TEntity>.
 */
export function makeCreateHandler<TEntity>(service: EntityService<TEntity>) {
  return async ({ body, set }: Context) => {
    const input = parseBody(body);
    const result = await service.create(input);

    if (result.success) {
      set.status = 201;
      return formatSuccess(result.data);
    }

    if (result.stage === "validation") {
      set.status = 400;
      return formatError("Validation failed", result.errors);
    }

    set.status = 500;
    return formatError(result.error);
  };
}
