// src/controller/atoms/middleware/authenticate.ts
// Authentication middleware — stub until user system is implemented

import { Elysia } from "elysia";

/**
 * Stub plugin — derives a null user into handler context.
 * Replace the derive body with real token validation when auth is added.
 */
export const authenticatePlugin = new Elysia().derive(() => ({
  user: null as null,
}));
