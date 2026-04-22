// src/controller/entities/item-modifier/item-modifier-binding-api.ts
// Layer 3 — nested JSON API routes for modifier bindings.
// All routes are scoped under /api/modifiers/:id/bindings.

import { Elysia } from "elysia";
import { ItemModifierBindingService } from "@model-service/entities/item-modifier";
import { parseBody } from "../../sub-atoms/request";
import { formatSuccess, formatError } from "../../sub-atoms/response";

export const ItemModifierBindingApi = new Elysia()
  // GET /api/modifiers/:id/bindings — list all bindings for a modifier
  .get("/api/modifiers/:id/bindings", async ({ params }) => {
    const modifierId = (params as Record<string, string>)["id"] as string;
    const bindings = await ItemModifierBindingService.findByModifier(modifierId);
    return formatSuccess(bindings);
  })

  // POST /api/modifiers/:id/bindings — add a new binding
  .post("/api/modifiers/:id/bindings", async ({ params, body, set }) => {
    const modifierId = (params as Record<string, string>)["id"] as string;
    const input = parseBody(body);
    const result = await ItemModifierBindingService.create(modifierId, input);

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

  // PUT /api/modifiers/:id/bindings/:bindingId — update a binding
  .put("/api/modifiers/:id/bindings/:bindingId", async ({ params, body, set }) => {
    const p = params as Record<string, string>;
    const modifierId = p["id"] as string;
    const bindingId = p["bindingId"] as string;
    const data = parseBody(body);
    const result = await ItemModifierBindingService.update(modifierId, bindingId, data);

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

  // DELETE /api/modifiers/:id/bindings/:bindingId — remove a binding
  .delete("/api/modifiers/:id/bindings/:bindingId", async ({ params, set }) => {
    const p = params as Record<string, string>;
    const modifierId = p["id"] as string;
    const bindingId = p["bindingId"] as string;
    const result = await ItemModifierBindingService.remove(modifierId, bindingId);

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
