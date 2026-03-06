// src/controller/sub-atoms/request/extract-params.ts
// Extracts and validates path parameters from ElysiaJS context

/**
 * Extracts the :id path parameter.
 * Throws if id is missing — routes should only call this when :id is in the path.
 */
export function extractId(params: Record<string, string>): string {
  const id = params["id"];
  if (!id) {
    throw new Error("Missing required path parameter: id");
  }
  return id;
}
