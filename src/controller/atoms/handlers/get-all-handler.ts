// src/controller/atoms/handlers/get-all-handler.ts
// Factory — returns a GET / handler bound to the given service

import type { Context } from "elysia";
import type { EntityService } from "../../sub-atoms/types";
import { extractQueryConditions } from "../../sub-atoms/request";
import { formatPaginated, formatError } from "../../sub-atoms/response";

/**
 * Returns a handler that fetches multiple entities with optional query filters.
 */
export function makeGetAllHandler<TEntity>(service: EntityService<TEntity>) {
  return async ({ query, set }: Context) => {
    const conditions = extractQueryConditions(query as Record<string, string>);
    const result = await service.findMany(conditions);

    if (result.success) {
      return formatPaginated(result.data);
    }

    set.status = 500;
    return formatError(result.error);
  };
}
