// src/controller/atoms/handlers/get-by-id-handler.ts
// Factory — returns a GET /:id handler bound to the given service

import type { Context } from "elysia";
import type { EntityService } from "../../sub-atoms/types";
import { extractId } from "../../sub-atoms/request";
import { formatSuccess, formatError } from "../../sub-atoms/response";

/**
 * Returns a handler that fetches a single entity by ID using the provided service.
 */
export function makeGetByIdHandler<TEntity>(service: EntityService<TEntity>) {
  return async ({ params, set }: Context) => {
    const id = extractId(params as Record<string, string>);
    const result = await service.findById(id);

    if (result.success) {
      return formatSuccess(result.data);
    }

    if (result.stage === "not_found") {
      set.status = 404;
      return formatError(result.error);
    }

    set.status = 500;
    return formatError(result.error);
  };
}
