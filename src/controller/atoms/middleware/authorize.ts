// src/controller/atoms/middleware/authorize.ts
// Authorization middleware — enforces Layer 0 permission config per operation.
// Maps HTTP method to CRUD operation, checks user role against required level.

import { Elysia } from "elysia";
import type { PermissionConfig, PermissionLevel } from "@config/types";
import type { AuthUser } from "./authenticate";
import { formatError } from "../../sub-atoms/response";

/**
 * Maps an HTTP method to a CRUD operation name.
 * GET → read, POST → create, PUT → update, DELETE → delete.
 */
function methodToOperation(method: string): keyof PermissionConfig {
  switch (method) {
    case "POST":
      return "create";
    case "PUT":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "read";
  }
}

/**
 * Checks whether a user satisfies the required permission level.
 * Hierarchy: public < authenticated < admin.
 */
function hasPermission(user: AuthUser | null, required: PermissionLevel): boolean {
  if (required === "public") return true;
  if (required === "authenticated") return user !== null;
  if (required === "admin") return user?.role === "admin";
  return false;
}

/**
 * Creates an authorization middleware bound to a specific entity's permissions.
 * Reads the PermissionConfig from Layer 0 and enforces it on every request.
 *
 * Usage: .use(makeAuthorizeMiddleware(GAME_DOMAIN_CONFIG.permissions))
 */
export function makeAuthorizeMiddleware(permissions: PermissionConfig) {
  return new Elysia().onBeforeHandle(({ request, set, ...rest }) => {
    // user is derived by authenticatePlugin earlier in the chain.
    // Elysia's type system doesn't propagate derived properties across plugins,
    // so we read it from the spread context at runtime.
    const user = (rest as Record<string, unknown>)["user"] as AuthUser | null | undefined;
    const operation = methodToOperation(request.method);
    const required = permissions[operation];

    if (!hasPermission(user ?? null, required)) {
      if (!user) {
        set.status = 401;
        return formatError("Authentication required");
      }
      set.status = 403;
      return formatError("Insufficient permissions");
    }
    return;
  });
}
