// src/controller/atoms/handlers/update-handler.ts
// Factory — returns a PUT /:id handler bound to the given service

import type { EntityService } from "../../sub-atoms/types";
import { extractId, parseBody } from "../../sub-atoms/request";
import { formatSuccess, formatError } from "../../sub-atoms/response";

/**
 * Returns a handler that updates an entity by ID and returns the updated record.
 */
export function makeUpdateHandler<TEntity>(service: EntityService<TEntity>) {
  return async ({ params, body, set }: { params: Record<string, string>; body: unknown; set: { status?: number | string } }) => {
    const id = extractId(params as Record<string, string>);
    const data = parseBody(body);
    const result = await service.update(id, data);

    if (result.success) {
      return formatSuccess(result.data);
    }

    if (result.stage === "validation") {
      set.status = 400;
      return formatError("Validation failed", result.errors);
    }

    if (result.stage === "not_found") {
      set.status = 404;
      return formatError(result.error);
    }

    set.status = 500;
    return formatError(result.error);
  };
}
