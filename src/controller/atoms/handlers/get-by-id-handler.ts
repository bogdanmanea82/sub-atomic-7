// src/controller/atoms/handlers/get-by-id-handler.ts
// Factory — returns a GET /:id handler bound to the given service

import type { EntityService } from "../../sub-atoms/types";
import { extractId } from "../../sub-atoms/request";
import { formatSuccess, formatError } from "../../sub-atoms/response";

/**
 * Returns a handler that fetches a single entity by ID using the provided service.
 */
export function makeGetByIdHandler<TEntity>(service: EntityService<TEntity>) {
  return async ({ params, set }: { params: Record<string, string>; set: { status?: number | string } }) => {
    const id = extractId(params);
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
