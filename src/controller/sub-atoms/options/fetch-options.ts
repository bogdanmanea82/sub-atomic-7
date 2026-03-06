// src/controller/sub-atoms/options/fetch-options.ts
// Fetches entities from a service and converts them to SelectOption[].
// Replaces getDomainOptions, getAllSubdomainOptions, etc. across all pages files.

import type { SelectOption } from "@view-service/types";

/**
 * Minimal service interface — only needs findMany.
 * Uses a discriminated union to match the actual SelectManyWorkflowResult shape.
 */
interface OptionService {
  findMany(
    conditions?: Record<string, unknown>,
  ): Promise<
    | { readonly success: true; readonly data: unknown[] }
    | { readonly success: false; readonly stage: string; readonly error: string }
  >;
}

/**
 * Fetches entities from a service and maps them to select options.
 * Optionally filters by conditions (e.g., { game_domain_id: "uuid" }).
 */
export async function fetchOptions(
  service: OptionService,
  conditions?: Record<string, unknown>,
): Promise<readonly SelectOption[]> {
  const result = await service.findMany(conditions);
  if (!result.success) return [];
  return result.data.map((d) => ({
    label: (d as unknown as { name: string }).name,
    value: (d as unknown as { id: string }).id,
  }));
}
