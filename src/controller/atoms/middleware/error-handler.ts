// src/controller/atoms/middleware/error-handler.ts
// Global error handler — catches unhandled throws before they reach the client

import { Elysia, NotFoundError, ParseError } from "elysia";
import { formatError } from "../../sub-atoms/response";

/**
 * Elysia plugin that intercepts unhandled errors and maps them to safe HTTP responses.
 * Workflow result errors (success: false) are handled in handler atoms — not here.
 * This catches unexpected throws: bugs, network failures, framework errors.
 * Intentionally local-scoped so ValidationError from child plugins (createCrudRoutes)
 * falls through to Elysia's built-in handler, which returns 422 correctly.
 */
export const errorHandlerPlugin = new Elysia().onError(({ error, set }) => {
  if (error instanceof NotFoundError) {
    set.status = 404;
    return formatError("Route not found");
  }

  if (error instanceof ParseError) {
    set.status = 400;
    return formatError("Invalid JSON in request body");
  }

  console.error("[Unhandled Error]", error);
  set.status = 500;
  return formatError("Internal Server Error");
});
