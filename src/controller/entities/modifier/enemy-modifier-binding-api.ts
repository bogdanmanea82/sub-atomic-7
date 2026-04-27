// src/controller/entities/modifier/enemy-modifier-binding-api.ts
// Layer 3 — nested JSON API routes for enemy modifier bindings.
// All routes are scoped under /api/modifiers/:id/enemy-bindings.
// Parallel to modifier-binding-api.ts (item bindings) but targets the Enemies hierarchy.

import { Elysia } from "elysia";
import { EnemyModifierBindingService } from "@model-service/entities/modifier";
import { parseBody } from "../../sub-atoms/request";
import { formatSuccess, formatError } from "../../sub-atoms/response";

export const EnemyModifierBindingApi = new Elysia()
  // GET /api/modifiers/:id/enemy-bindings — list all enemy bindings for a modifier
  .get("/api/modifiers/:id/enemy-bindings", async ({ params }) => {
    const modifierId = (params as Record<string, string>)["id"] as string;
    const bindings = await EnemyModifierBindingService.findByModifier(modifierId);
    return formatSuccess(bindings);
  })

  // POST /api/modifiers/:id/enemy-bindings — add a new enemy binding
  .post("/api/modifiers/:id/enemy-bindings", async ({ params, body, set }) => {
    const modifierId = (params as Record<string, string>)["id"] as string;
    const input = parseBody(body);
    const result = await EnemyModifierBindingService.create(modifierId, input);

    if (result.success) {
      set.status = 201;
      return formatSuccess(result.data);
    }

    if (result.stage === "validation") {
      set.status = 400;
      return formatError("Validation failed", result.errors);
    }

    set.status = 500;
    return formatError(result.error);
  })

  // PUT /api/modifiers/:id/enemy-bindings/:bindingId — update an enemy binding
  .put("/api/modifiers/:id/enemy-bindings/:bindingId", async ({ params, body, set }) => {
    const p = params as Record<string, string>;
    const modifierId = p["id"] as string;
    const bindingId = p["bindingId"] as string;
    const data = parseBody(body);
    const result = await EnemyModifierBindingService.update(modifierId, bindingId, data);

    if (result.success) {
      return formatSuccess(result.data);
    }

    if (result.stage === "validation") {
      set.status = 400;
      return formatError("Validation failed", result.errors);
    }

    if (result.stage === "not_found") {
      set.status = 404;
      return formatError(result.error);
    }

    set.status = 500;
    return formatError(result.error);
  })

  // DELETE /api/modifiers/:id/enemy-bindings/:bindingId — remove an enemy binding
  .delete("/api/modifiers/:id/enemy-bindings/:bindingId", async ({ params, set }) => {
    const p = params as Record<string, string>;
    const modifierId = p["id"] as string;
    const bindingId = p["bindingId"] as string;
    const result = await EnemyModifierBindingService.remove(modifierId, bindingId);

    if (result.success) {
      set.status = 204;
      return formatSuccess(null);
    }

    if (result.stage === "not_found") {
      set.status = 404;
      return formatError(result.error);
    }

    set.status = 500;
    return formatError(result.error);
  });
