// src/controller/atoms/middleware/authenticate.ts
// Authentication middleware — resolves the current user from request headers.
// Uses a simple token lookup until a real user/session system is implemented.
// Replace resolveUser() internals when switching to JWT or database sessions.

import { Elysia } from "elysia";

/**
 * Represents the authenticated user attached to every request context.
 * null means anonymous/unauthenticated visitor.
 */
export interface AuthUser {
  readonly id: string;
  readonly role: "authenticated" | "admin";
}

/**
 * Resolves a user from a Bearer token.
 * Current implementation: static token map for development.
 * Replace this function body with real lookup (JWT decode, session DB query, etc.)
 */
function resolveUser(authHeader: string | null): AuthUser | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (token === "") return null;

  // Development tokens — replace with real token validation
  const tokenMap: Record<string, AuthUser> = {
    "dev-admin-token": { id: "dev-admin", role: "admin" },
    "dev-user-token": { id: "dev-user", role: "authenticated" },
  };

  return tokenMap[token] ?? null;
}

/**
 * Derives the current user into handler context from the Authorization header.
 * Every downstream handler receives `user: AuthUser | null`.
 */
export const authenticatePlugin = new Elysia().derive(
  { as: "scoped" },
  ({ request }) => ({
    user: resolveUser(request.headers.get("authorization")),
  }),
);
