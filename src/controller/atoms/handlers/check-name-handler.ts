// src/controller/atoms/handlers/check-name-handler.ts
// Factory that creates a check-name route handler for any entity.
// Returns { available: boolean } based on whether the name is unique.

/**
 * Minimal service interface — needs findMany to look up existing names.
 */
interface CheckNameService {
  findMany(
    conditions?: Record<string, unknown>,
  ): Promise<
    | { readonly success: true; readonly data: unknown[] }
    | { readonly success: false; readonly stage: string; readonly error: string }
  >;
}

/**
 * Creates a check-name handler for an entity.
 *
 * @param service - The entity's service (needs findMany)
 * @param scopeField - Query param name for the scope (e.g., "gameDomainId"), or undefined for unscoped
 * @param scopeDbField - Database column for the scope (e.g., "game_domain_id"), or undefined for unscoped
 */
export function makeCheckNameHandler(
  service: CheckNameService,
  scopeField?: string,
  scopeDbField?: string,
) {
  return async ({ query }: { query: Record<string, string> }) => {
    const q = query as Record<string, string>;
    const name = q["name"] ?? "";
    const excludeId = q["excludeId"] ?? "";

    if (name.trim() === "") {
      return { available: false };
    }

    // Build conditions: always include name, optionally include scope
    const conditions: Record<string, unknown> = { name };
    if (scopeField && scopeDbField) {
      const scopeValue = q[scopeField] ?? "";
      if (scopeValue.trim() === "") {
        return { available: false };
      }
      conditions[scopeDbField] = scopeValue;
    }

    const result = await service.findMany(conditions);
    if (!result.success) {
      return { available: false };
    }

    const conflicts = excludeId
      ? result.data.filter((d) => (d as unknown as { id: string }).id !== excludeId)
      : result.data;

    return { available: conflicts.length === 0 };
  };
}
