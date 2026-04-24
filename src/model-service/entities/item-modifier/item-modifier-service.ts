// src/model-service/entities/item-modifier/item-modifier-service.ts
// Layer 2 organism — public API for all ItemModifier database operations.

import type { ItemModifier } from "@model/entities/item-modifier/item-modifier-model";
import type { ItemModifierTier } from "@model/entities/item-modifier-tier/item-modifier-tier-model";
import { ItemModifierModel } from "@model/entities/item-modifier/item-modifier-model";
import { ItemModifierTierModel } from "@model/entities/item-modifier-tier/item-modifier-tier-model";
import { ITEM_MODIFIER_CONFIG } from "@config/entities/item-modifier";
import { getConnection, withTransaction, executeWrite } from "../../sub-atoms/database";
import {
  parseTiersFromInput,
  insertTiers,
  fetchTiers,
  createTierOrchestration,
} from "../../sub-atoms/tiers";
import type { HasTiers } from "../../sub-atoms/tiers";
import {
  type CreateWorkflowResult,
} from "../../molecules/workflows/create-entity-workflow";
import {
  selectEntityWorkflow,
  type SelectWorkflowResult,
} from "../../molecules/workflows/select-entity-workflow";
import {
  selectManyWorkflow,
  type SelectManyWorkflowResult,
} from "../../molecules/workflows/select-many-workflow";
import {
  selectManyPaginatedWorkflow,
  type SelectManyPaginatedResult,
} from "../../molecules/workflows/select-many-paginated-workflow";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import {
  type UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";
import { checkFieldUniqueness } from "../../atoms/uniqueness";
import { insertRecord, selectMany } from "../../atoms/crud";
import { validateTierSet, type TierInput } from "../../atoms/validation/validate-tier-set";


const NAME_ERROR = "A ItemModifier with this name already exists in this subcategory.";
const CODE_ERROR = "A ItemModifier with this code already exists in this subcategory.";

// Extended result types that include tiers
export type ItemModifierWithTiers = ItemModifier & { readonly tiers: readonly ItemModifierTier[] };

type CreateModifierResult = CreateWorkflowResult<ItemModifier>;
type UpdateModifierResult = UpdateWorkflowResult<ItemModifier>;

/**
 * Runs both name and code uniqueness checks scoped to game_subcategory_id.
 */
async function checkUniqueness(
  input: Record<string, unknown>,
  excludeId?: string,
): Promise<Record<string, string> | null> {
  const db = getConnection();
  const name = input["name"];
  const code = input["code"];
  const subcategoryId = input["game_subcategory_id"];

  if (typeof subcategoryId !== "string") return null;

  const scope = { game_subcategory_id: subcategoryId };
  const errors: Record<string, string> = {};

  if (typeof name === "string" && name.trim() !== "") {
    const nameCheck = await checkFieldUniqueness(db, ItemModifierModel, "name", name, NAME_ERROR, scope, excludeId);
    if (!nameCheck.available) errors["name"] = nameCheck.error;
  }

  if (typeof code === "string" && code.trim() !== "") {
    const codeCheck = await checkFieldUniqueness(db, ItemModifierModel, "code", code, CODE_ERROR, scope, excludeId);
    if (!codeCheck.available) errors["code"] = codeCheck.error;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Translates status_action radio value into entity field values.
 * Two states only: "active" and "disabled".
 * Archive lifecycle is deferred — it will link to the Observability layer.
 * Also clears archived_reason / archived_at so old archive data is not left stale.
 */
function applyStatusAction(data: Record<string, unknown>): void {
  if (data["status_action"] === "disabled") {
    data["is_active"] = "false";
  } else {
    data["is_active"] = "true";
  }
  data["archived_reason"] = null;
  data["archived_at"] = null;
}

/**
 * The shared 4-step validation preamble run before both create and update.
 * Mutates data in place (status fields), then checks uniqueness and tiers.
 * Returns the parsed tier set on success so callers do not need to re-parse.
 */
type ValidateModifierInputResult =
  | { valid: true; tiers: TierInput[] }
  | { valid: false; errors: Record<string, string> };

async function validateModifierInput(
  data: Record<string, unknown>,
  excludeId?: string,
): Promise<ValidateModifierInputResult> {
  // Step 1: translate status_action → is_active / archived fields
  applyStatusAction(data);

  // Step 2: name + code uniqueness scoped to game_subcategory_id
  const uniquenessErrors = await checkUniqueness(data, excludeId);
  if (uniquenessErrors) {
    return { valid: false, errors: uniquenessErrors };
  }

  // Step 3: parse tiers_json from form input
  const tiers = parseTiersFromInput(data);
  if (!tiers) {
    return { valid: false, errors: { tiers: "Tier data is required" } };
  }

  // Step 4: cross-row tier validation (gapless indexes, progressive values)
  const tierValidation = validateTierSet(tiers);
  if (!tierValidation.valid) {
    return { valid: false, errors: tierValidation.errors };
  }

  return { valid: true, tiers };
}

// Core service methods — no tier orchestration yet.
// Named _core so the orchestration factory can reference findById before the
// final export is assembled. The lazy closure is not needed here because
// _core is fully defined by the time createTierOrchestration runs below.
const _core = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateModifierResult> {
    const validation = await validateModifierInput(input);
    if (!validation.valid) {
      return { success: false, stage: "validation", errors: validation.errors };
    }
    const { tiers } = validation;

    const db = getConnection();
    const modifierId = crypto.randomUUID();
    const inputWithId = { ...input, id: modifierId };

    // Validate and prepare modifier query (Layer 1)
    let modifierQuery;
    try {
      modifierQuery = ItemModifierModel.prepareCreate(inputWithId);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    // Transactional insert: modifier + all tiers
    try {
      await withTransaction(db, async (txDb) => {
        await insertRecord(txDb, modifierQuery);
        await insertTiers(txDb, ItemModifierTierModel, modifierId, tiers);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    // Fetch the created record
    const selectQuery = ItemModifierModel.prepareSelect({ id: modifierId });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "database", error: "Failed to retrieve created record" };
    }

    return { success: true, data: ItemModifierModel.deserialize(rows[0]!) };
  },

  async findById(id: string): Promise<SelectWorkflowResult<ItemModifierWithTiers>> {
    const db = getConnection();
    const result = await selectEntityWorkflow(db, ITEM_MODIFIER_CONFIG, ItemModifierModel, id);
    if (!result.success) return result;

    const tiers = await fetchTiers(db, ItemModifierTierModel, id);
    return { success: true, data: { ...result.data, tiers } };
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<ItemModifier>> {
    const db = getConnection();
    return selectManyWorkflow(db, ItemModifierModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<ItemModifier>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, ItemModifierModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateModifierResult> {
    const validation = await validateModifierInput(data, id);
    if (!validation.valid) {
      return { success: false, stage: "validation", errors: validation.errors };
    }
    const { tiers } = validation;

    const db = getConnection();

    // Strip virtual form keys (defined in config) before building the update query
    const nonColumnKeys = ITEM_MODIFIER_CONFIG.nonColumnKeys ?? [];
    const modifierData = nonColumnKeys.length
      ? Object.fromEntries(Object.entries(data).filter(([k]) => !nonColumnKeys.includes(k)))
      : { ...data };
    let updateQuery;
    try {
      updateQuery = ItemModifierModel.prepareUpdate(modifierData, { id });
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    // Transactional: update modifier + delete old tiers + insert new tiers
    try {
      await withTransaction(db, async (txDb) => {
        await executeWrite(txDb, updateQuery);
        const deleteQuery = ItemModifierTierModel.prepareDelete({ modifier_id: id });
        await executeWrite(txDb, deleteQuery);
        await insertTiers(txDb, ItemModifierTierModel, id, tiers);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    // Fetch the updated record
    const selectQuery = ItemModifierModel.prepareSelect({ id });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "not_found", error: `Record ${id} not found after update` };
    }

    return { success: true, data: ItemModifierModel.deserialize(rows[0]!) };
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, ItemModifierModel, id);
  },

  /**
   * Checks whether a field value is available (unique) within an optional scope.
   * Used for inline availability checks — e.g. name and code uniqueness within a subcategory.
   *
   * Returns { available: false } immediately if value is blank or any required scope
   * value is missing, so callers never need to guard those cases themselves.
   */
  async checkFieldAvailable(
    fieldName: string,
    value: string,
    scope?: Record<string, string>,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (value.trim() === "") return { available: false };
    if (scope && Object.values(scope).some((v) => v.trim() === "")) {
      return { available: false };
    }

    const db = getConnection();
    const conditions: Record<string, unknown> = { [fieldName]: value, ...scope };
    const result = await selectManyWorkflow(db, ItemModifierModel, conditions);
    if (!result.success) return { available: false };

    const conflicts = excludeId
      ? result.data.filter((d) => d.id !== excludeId)
      : result.data;

    return { available: conflicts.length === 0 };
  },

};

// ── Tier orchestration ────────────────────────────────────────────────────────
// replaceTiers / addTier / updateTier / deleteTier come from the shared factory.
// _core is fully constructed above so we can reference _core.findById directly —
// no lazy closure trick needed.

const _tierOrchestration = createTierOrchestration<HasTiers<ItemModifierWithTiers>>(
  ItemModifierTierModel,
  (id) => _core.findById(id),
  "modifier_id",
);

// Merge core + tier orchestration into the public export.
// TypeScript sees the full combined type — L3 callers can access all methods.
export const ItemModifierService = { ..._core, ..._tierOrchestration };
