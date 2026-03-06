// src/controller/sub-atoms/request/parse-body.ts
// Normalizes ElysiaJS body into the Record<string, unknown> Layer 2 expects

/**
 * Validates that the request body is a plain JSON object.
 * Throws if body is null, an array, or a primitive.
 * ElysiaJS parses JSON automatically — this guards against wrong shapes.
 */
export function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object");
  }
  return body as Record<string, unknown>;
}
