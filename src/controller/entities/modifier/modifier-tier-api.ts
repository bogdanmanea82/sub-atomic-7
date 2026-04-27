// src/controller/entities/item-modifie./modifier-tier-api.ts
// REST API endpoints for individual tier CRUD on a modifier's detail page.
// Handlers are thin HTTP adapters — all tier manipulation logic lives in ModifierService.

import { Elysia } from "elysia";
import { ModifierService } from "@model-service/entities/modifier";
import { formatSuccess, formatError } from "../../sub-atoms/response";

export const ItemModifierTierApi = new Elysia()

  // ── Add a tier ──────────────────────────────────────────────────────────
  .post("/api/modifiers/:id/tiers", async ({ params, body, set }) => {
    const modifierId = params["id"];
    const input = body as Record<string, unknown>;

    const result = await ModifierService.addTier(modifierId, input);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 422;
      return formatError(result.error);
    }
    return formatSuccess(result.tiers);
  })

  // ── Update a tier ───────────────────────────────────────────────────────
  .put("/api/modifiers/:id/tiers/:tierIndex", async ({ params, body, set }) => {
    const modifierId = params["id"];
    const tierIndex = Number(params["tierIndex"]);
    const input = body as Record<string, unknown>;

    const result = await ModifierService.updateTier(modifierId, tierIndex, input);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 422;
      return formatError(result.error);
    }
    return formatSuccess(result.tiers);
  })

  // ── Delete a tier ───────────────────────────────────────────────────────
  .delete("/api/modifiers/:id/tiers/:tierIndex", async ({ params, set }) => {
    const modifierId = params["id"];
    const tierIndex = Number(params["tierIndex"]);

    const result = await ModifierService.deleteTier(modifierId, tierIndex);
    if (!result.success) {
      set.status = result.stage === "not_found" ? 404 : 422;
      return formatError(result.error);
    }
    return formatSuccess(result.tiers);
  });
