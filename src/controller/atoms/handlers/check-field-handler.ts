// src/controller/atoms/handlers/check-field-handler.ts
// Factory that creates a check-field route handler for any entity and any field.
// Generalized version of check-name-handler — works with any field name.

interface CheckFieldService {
  findMany(
    conditions?: Record<string, unknown>,
  ): Promise<
    | { readonly success: true; readonly data: unknown[] }
    | { readonly success: false; readonly stage: string; readonly error: string }
  >;
}

/**
 * Creates a check-field handler for an entity.
 *
 * @param service - The entity's service (needs findMany)
 * @param fieldName - The field to check (e.g., "name", "code")
 * @param scopeField - Query param name for the scope (e.g., "gameSubcategoryId"), or undefined for unscoped
 * @param scopeDbField - Database column for the scope (e.g., "game_subcategory_id"), or undefined for unscoped
 */
export function makeCheckFieldHandler(
  service: CheckFieldService,
  fieldName: string,
  scopeField?: string,
  scopeDbField?: string,
) {
  return async ({ query }: { query: Record<string, string> }) => {
    const q = query as Record<string, string>;
    const value = q[fieldName] ?? "";
    const excludeId = q["excludeId"] ?? "";

    if (value.trim() === "") {
      return { available: false };
    }

    const conditions: Record<string, unknown> = { [fieldName]: value };
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
