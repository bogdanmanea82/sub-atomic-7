// src/controller/atoms/middleware/error-handler.ts
// Global error handler — catches unhandled throws before they reach the client

import { Elysia, NotFoundError, ParseError } from "elysia";
  import { formatError } from "../../sub-atoms/response";

/**
 * Elysia plugin that intercepts unhandled errors and maps them to safe HTTP responses.
 * Workflow result errors (success: false) are handled in handler atoms — not here.
 * This catches unexpected throws: bugs, network failures, framework errors.
 */
export const errorHandlerPlugin = new Elysia().onError(({ error, set }) => {
  // ElysiaJS throws a string code "NOT_FOUND" when no route matches
    if (error instanceof NotFoundError) {
      set.status = 404;
      return formatError("Route not found");
    }

  // ElysiaJS throws "PARSE" when request body is not valid JSON
if (error instanceof ParseError) {
      set.status = 400;
      return formatError("Invalid JSON in request body");
    }

  // Unknown error — log the real details server-side, never send to client
    console.error("[Unhandled Error]", error);
    set.status = 500;
    return formatError("Internal Server Error");
  });
