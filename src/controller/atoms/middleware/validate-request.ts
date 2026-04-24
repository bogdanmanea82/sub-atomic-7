// src/controller/atoms/middleware/validate-request.ts
// Request validation middleware — enforces JSON content-type on write operations

import { Elysia } from "elysia";
import { formatError } from "../../sub-atoms/response";

/**
 * Ensures POST and PUT requests declare application/json content-type.
 * ElysiaJS parses the body, but this guards against accidental form submissions.
 */
export const validateRequestPlugin = new Elysia().onBeforeHandle(
  { as: "scoped" },
  ({ request, set }) => {
    const method = request.method;
    const contentType = request.headers.get("content-type") ?? "";

    if (
      (method === "POST" || method === "PUT") &&
      !contentType.includes("application/json")
    ) {
      set.status = 415;
      return formatError("Content-Type must be application/json");
    }
    return; // explicit — no short-circuit, request proceeds normally
  },
);
