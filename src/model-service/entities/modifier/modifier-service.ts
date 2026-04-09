// src/model-service/entities/modifier/modifier-service.ts
// Layer 2 organism — public API for all Modifier database operations.

import type { SQL } from "bun";
import type { Modifier } from "@model/entities/modifier/modifier-model";
import type { ModifierTier } from "@model/entities/modifier-tier/modifier-tier-model";
import { ModifierModel } from "@model/entities/modifier/modifier-model";
import { ModifierTierModel } from "@model/entities/modifier-tier/modifier-tier-model";
import { MODIFIER_CONFIG } from "@config/entities/modifier";
import { getConnection, withTransaction, executeWrite } from "../../sub-atoms/database";
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

// Keys that are service-layer concerns, not modifier table columns
const NON_COLUMN_KEYS = ["tiers_json", "tiers", "status_action", "status_reason"] as const;

function stripNonColumnKeys(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...data };
  for (const key of NON_COLUMN_KEYS) {
    delete cleaned[key];
  }
  return cleaned;
}

const NAME_ERROR = "A Modifier with this name already exists in this subcategory.";
const CODE_ERROR = "A Modifier with this code already exists in this subcategory.";

// Extended result types that include tiers
export type ModifierWithTiers = Modifier & { readonly tiers: readonly ModifierTier[] };

type CreateModifierResult = CreateWorkflowResult<Modifier>;
type UpdateModifierResult = UpdateWorkflowResult<Modifier>;

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
    const nameCheck = await checkFieldUniqueness(db, ModifierModel, "name", name, NAME_ERROR, scope, excludeId);
    if (!nameCheck.available) errors["name"] = nameCheck.error;
  }

  if (typeof code === "string" && code.trim() !== "") {
    const codeCheck = await checkFieldUniqueness(db, ModifierModel, "code", code, CODE_ERROR, scope, excludeId);
    if (!codeCheck.available) errors["code"] = codeCheck.error;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Parses and coerces the tiers_json field from form input into typed tier inputs.
 * Form values arrive as strings — we parse the JSON then coerce numeric fields.
 */
function parseTiersFromInput(input: Record<string, unknown>): TierInput[] | null {
  const raw = input["tiers_json"];
  if (typeof raw !== "string" || raw.trim() === "") return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((t) => ({
      tier_index: Number(t["tier_index"]),
      min_value: Number(t["min_value"]),
      max_value: Number(t["max_value"]),
      level_req: Number(t["level_req"]),
      spawn_weight: Number(t["spawn_weight"]),
    }));
  } catch {
    return null;
  }
}

/**
 * Inserts all tiers for a modifier inside a transaction-scoped connection.
 */
async function insertTiers(
  txDb: SQL,
  modifierId: string,
  tiers: readonly TierInput[],
): Promise<void> {
  for (const tier of tiers) {
    const tierInput: Record<string, unknown> = {
      id: crypto.randomUUID(),
      modifier_id: modifierId,
      tier_index: tier.tier_index,
      min_value: tier.min_value,
      max_value: tier.max_value,
      level_req: tier.level_req,
      spawn_weight: tier.spawn_weight,
    };
    const query = ModifierTierModel.prepareCreate(tierInput);
    await insertRecord(txDb, query);
  }
}

/**
 * Fetches all tiers for a modifier, ordered by tier_index.
 */
async function fetchTiers(db: SQL, modifierId: string): Promise<ModifierTier[]> {
  const query = ModifierTierModel.prepareSelect({ modifier_id: modifierId });
  const rows = await selectMany(db, query);
  return rows
    .map((row) => ModifierTierModel.deserialize(row))
    .sort((a, b) => a.tier_index - b.tier_index);
}

/** Derives the old state from the current DB row. */
type StatusState = "active" | "disabled" | "archived";

/**
 * Translates status_action radio value into entity field values.
 * Sets is_active, archived_reason, archived_at on the data object.
 */
function applyStatusAction(data: Record<string, unknown>): { action: StatusState; reason: string | undefined } {
  const statusAction = data["status_action"] as string | undefined;
  const statusReason = ((data["status_reason"] as string) ?? "").trim() || undefined;

  if (statusAction === "disabled") {
    data["is_active"] = "false";
    data["archived_reason"] = null;
    data["archived_at"] = null;
    return { action: "disabled", reason: statusReason };
  }
  if (statusAction === "archived") {
    data["is_active"] = "false";
    data["archived_reason"] = statusReason ?? null;
    data["archived_at"] = new Date().toISOString();
    return { action: "archived", reason: statusReason };
  }
  // Default: active
  data["is_active"] = "true";
  data["archived_reason"] = null;
  data["archived_at"] = null;
  return { action: "active", reason: statusReason };
}

export const ModifierService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateModifierResult> {
    // Translate status_action to is_active/archived fields
    applyStatusAction(input);

    // Uniqueness check
    const uniquenessErrors = await checkUniqueness(input);
    if (uniquenessErrors) {
      return { success: false, stage: "validation", errors: uniquenessErrors };
    }

    // Parse and validate tiers
    const tiers = parseTiersFromInput(input);
    if (!tiers) {
      return { success: false, stage: "validation", errors: { tiers: "Tier data is required" } };
    }
    const tierValidation = validateTierSet(tiers);
    if (!tierValidation.valid) {
      return { success: false, stage: "validation", errors: tierValidation.errors };
    }

    const db = getConnection();
    const modifierId = crypto.randomUUID();
    const inputWithId = { ...input, id: modifierId };

    // Validate and prepare modifier query (Layer 1)
    let modifierQuery;
    try {
      modifierQuery = ModifierModel.prepareCreate(inputWithId);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    // Transactional insert: modifier + all tiers
    try {
      await withTransaction(db, async (txDb) => {
        await insertRecord(txDb, modifierQuery);
        await insertTiers(txDb, modifierId, tiers);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    // Fetch the created record
    const selectQuery = ModifierModel.prepareSelect({ id: modifierId });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "database", error: "Failed to retrieve created record" };
    }

    return { success: true, data: ModifierModel.deserialize(rows[0]!) };
  },

  async findById(id: string): Promise<SelectWorkflowResult<ModifierWithTiers>> {
    const db = getConnection();
    const result = await selectEntityWorkflow(db, MODIFIER_CONFIG, ModifierModel, id);
    if (!result.success) return result;

    const tiers = await fetchTiers(db, id);
    return { success: true, data: { ...result.data, tiers } };
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<Modifier>> {
    const db = getConnection();
    return selectManyWorkflow(db, ModifierModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<Modifier>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, ModifierModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateModifierResult> {
    // Translate status_action radio to is_active/archived fields
    applyStatusAction(data);

    // Uniqueness check
    const uniquenessErrors = await checkUniqueness(data, id);
    if (uniquenessErrors) {
      return { success: false, stage: "validation", errors: uniquenessErrors };
    }

    // Parse and validate tiers
    const tiers = parseTiersFromInput(data);
    if (!tiers) {
      return { success: false, stage: "validation", errors: { tiers: "Tier data is required" } };
    }
    const tierValidation = validateTierSet(tiers);
    if (!tierValidation.valid) {
      return { success: false, stage: "validation", errors: tierValidation.errors };
    }

    const db = getConnection();

    // Validate and prepare modifier update query (Layer 1)
    const modifierData = stripNonColumnKeys(data);
    let updateQuery;
    try {
      updateQuery = ModifierModel.prepareUpdate(modifierData, { id });
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    // Transactional: update modifier + delete old tiers + insert new tiers
    try {
      await withTransaction(db, async (txDb) => {
        await executeWrite(txDb, updateQuery);
        const deleteQuery = ModifierTierModel.prepareDelete({ modifier_id: id });
        await executeWrite(txDb, deleteQuery);
        await insertTiers(txDb, id, tiers);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    // Fetch the updated record
    const selectQuery = ModifierModel.prepareSelect({ id });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "not_found", error: `Record ${id} not found after update` };
    }

    return { success: true, data: ModifierModel.deserialize(rows[0]!) };
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, ModifierModel, id);
  },

  /**
   * Replaces all tiers for a modifier with a new set.
   * Validates the full set and persists via delete-all-then-reinsert.
   * Returns the validated tier set on success, or validation errors on failure.
   */
  async replaceTiers(
    modifierId: string,
    tiers: readonly TierInput[],
  ): Promise<{ success: true; tiers: readonly TierInput[] } | { success: false; error: string }> {
    // Allow empty set (all tiers deleted)
    if (tiers.length > 0) {
      const validation = validateTierSet(tiers);
      if (!validation.valid) {
        return { success: false, error: Object.values(validation.errors).join("; ") };
      }
    }

    const db = getConnection();
    await withTransaction(db, async (txDb) => {
      const deleteQuery = ModifierTierModel.prepareDelete({ modifier_id: modifierId });
      await executeWrite(txDb, deleteQuery);
      await insertTiers(txDb, modifierId, tiers);
    });

    return { success: true, tiers };
  },
};
