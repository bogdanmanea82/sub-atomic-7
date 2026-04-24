// src/controller/atoms/handlers/delete-handler.ts
// Factory — returns a DELETE /:id handler bound to the given service

import type { EntityService } from "../../sub-atoms/types";
import { extractId } from "../../sub-atoms/request";
import { formatSuccess, formatError } from "../../sub-atoms/response";

/**
 * Returns a handler that deletes an entity by ID.
 * Returns 204 No Content on success (null data — record no longer exists).
 */
export function makeDeleteHandler(service: EntityService<unknown>) {
  return async ({ params, set }: { params: Record<string, string>; set: { status?: number | string } }) => {
    const id = extractId(params);
    const result = await service.delete(id);

    if (result.success) {
      set.status = 204;
      return formatSuccess(null);
    }

    if (result.stage === "not_found") {
      set.status = 404;
      return formatError(result.error);
    }

    set.status = 500;
    return formatError(result.error);
  };
}
