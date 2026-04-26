// src/model-service/entities/item/item-service.ts
// Layer 2 organism — public API for all Item database operations.
//
// Item owns an implicit stat sheet (item_stat_base rows). Every create/update
// carries stat_sheet_json: a serialized array of { stat_id, base_value } pairs.
// Zero-value rows are filtered before insert — items have sparse bases.
// The stat sheet is persisted using delete-all-then-reinsert inside a transaction.

import type { SQL } from "bun";
import type { Item } from "@model/entities/item/item-model";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { ItemModel } from "@model/entities/item/item-model";
import { ItemStatBaseModel } from "@model/entities/item-stat-base/item-stat-base-model";
import { ITEM_CONFIG } from "@config/entities/item";
import {
  getConnection,
  withTransaction,
  executeWrite,
  executeSelect,
} from "../../sub-atoms/database";
import type { CreateWorkflowResult } from "../../molecules/workflows/create-entity-workflow";
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
import type { UpdateWorkflowResult } from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";
import { checkNameAndMachineNameUniqueness, checkNameUniqueness, checkFieldUniqueness } from "../../atoms/uniqueness";
import { applyStatusAction } from "../../sub-atoms/apply-status-action";
import { insertRecord, selectMany } from "../../atoms/crud";

// ── Public types ──────────────────────────────────────────────────────────────

export type ItemStatSheetRow = {
  readonly id: string;
  readonly stat_id: string;
  readonly stat_machine_name: string;
  readonly stat_name: string;
  readonly stat_data_type: string;
  readonly stat_value_min: number;
  readonly stat_value_max: number;
  readonly stat_default_value: number;
  readonly stat_category: string;
  readonly combination_type: string;
  readonly base_value: number;
};

export type ItemWithStats = Item & {
  readonly statSheet: readonly ItemStatSheetRow[];
};

// ── Internal types ────────────────────────────────────────────────────────────

type StatSheetInputRow = { stat_id: string; base_value: number };

const NAME_ERROR = "An Item with this name already exists.";
const MACHINE_NAME_ERROR = "An Item with this machine_name already exists.";

// ── Sub-atoms ─────────────────────────────────────────────────────────────────

function parseStatSheetFromInput(data: Record<string, unknown>): StatSheetInputRow[] | null {
  const raw = data["stat_sheet_json"];
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as StatSheetInputRow[];
  } catch {
    return null;
  }
}

async function validateStatSheetBounds(
  db: SQL,
  rows: StatSheetInputRow[],
): Promise<Record<string, string> | null> {
  if (rows.length === 0) return null;
  const statIds = rows.map((r) => r.stat_id);

  const placeholders = statIds.map(() => "?").join(", ");
  const statRows = await executeSelect(db, {
    sql: `SELECT id, name, value_min, value_max FROM stat WHERE id IN (${placeholders})`,
    params: statIds,
  });

  const statBounds = new Map(
    statRows.map((r) => [
      r["id"] as string,
      { name: r["name"] as string, min: Number(r["value_min"]), max: Number(r["value_max"]) },
    ]),
  );

  const errors: Record<string, string> = {};
  for (const row of rows) {
    const bounds = statBounds.get(row.stat_id);
    if (!bounds) continue;
    if (row.base_value < bounds.min || row.base_value > bounds.max) {
      errors[`stat_${row.stat_id}`] =
        `${bounds.name}: value ${row.base_value} is out of range [${bounds.min}, ${bounds.max}]`;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

async function insertStatSheet(
  txDb: SQL,
  itemId: string,
  rows: StatSheetInputRow[],
): Promise<void> {
  for (const row of rows) {
    const query = ItemStatBaseModel.prepareCreate({
      id: crypto.randomUUID(),
      item_id: itemId,
      stat_id: row.stat_id,
      combination_type: "flat",
      base_value: row.base_value,
    });
    await insertRecord(txDb, query);
  }
}

async function fetchStatSheet(db: SQL, itemId: string): Promise<ItemStatSheetRow[]> {
  const rows = await db.unsafe(
    `SELECT
      isb.id,
      isb.stat_id,
      isb.combination_type,
      isb.base_value,
      s.machine_name AS stat_machine_name,
      s.name        AS stat_name,
      s.data_type   AS stat_data_type,
      s.value_min   AS stat_value_min,
      s.value_max   AS stat_value_max,
      s.default_value AS stat_default_value,
      s.category    AS stat_category
    FROM item_stat_base isb
    JOIN stat s ON s.id = isb.stat_id
    WHERE isb.item_id = $1
    ORDER BY s.category, s.name`,
    [itemId],
  ) as Record<string, unknown>[];

  return rows.map((r) => ({
    id: r["id"] as string,
    stat_id: r["stat_id"] as string,
    stat_machine_name: r["stat_machine_name"] as string,
    stat_name: r["stat_name"] as string,
    stat_data_type: r["stat_data_type"] as string,
    stat_value_min: Number(r["stat_value_min"]),
    stat_value_max: Number(r["stat_value_max"]),
    stat_default_value: Number(r["stat_default_value"]),
    stat_category: r["stat_category"] as string,
    combination_type: r["combination_type"] as string,
    base_value: Number(r["base_value"]),
  }));
}

// ── Service ───────────────────────────────────────────────────────────────────

export const ItemService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<Item>> {
    const db = getConnection();

    const conflict = await checkNameAndMachineNameUniqueness(db, ItemModel, input, NAME_ERROR, MACHINE_NAME_ERROR);
    if (conflict) return conflict;

    const statSheet = parseStatSheetFromInput(input);
    if (!statSheet) {
      return { success: false, stage: "validation", errors: { stat_sheet_json: "Stat sheet data is required" } };
    }

    // Only persist non-zero rows — items have sparse bases
    const nonZeroRows = statSheet.filter((r) => r.base_value !== 0);

    const boundsErrors = await validateStatSheetBounds(db, nonZeroRows);
    if (boundsErrors) {
      return { success: false, stage: "validation", errors: boundsErrors };
    }

    const itemId = crypto.randomUUID();
    const inputWithId = { ...input, id: itemId };

    let itemQuery;
    try {
      itemQuery = ItemModel.prepareCreate(inputWithId);
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    try {
      await withTransaction(db, async (txDb) => {
        await insertRecord(txDb, itemQuery);
        await insertStatSheet(txDb, itemId, nonZeroRows);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    const selectQuery = ItemModel.prepareSelect({ id: itemId });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "database", error: "Failed to retrieve created record" };
    }

    return { success: true, data: ItemModel.deserialize(rows[0]!) };
  },

  async findById(id: string): Promise<SelectWorkflowResult<ItemWithStats>> {
    const db = getConnection();
    const result = await selectEntityWorkflow(db, ITEM_CONFIG, ItemModel, id);
    if (!result.success) return result;

    const statSheet = await fetchStatSheet(db, id);
    return { success: true, data: { ...result.data, statSheet } };
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<Item>> {
    const db = getConnection();
    return selectManyWorkflow(db, ItemModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<Item>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, ItemModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<Item>> {
    const db = getConnection();

    const conflict = await checkNameAndMachineNameUniqueness(db, ItemModel, data, NAME_ERROR, MACHINE_NAME_ERROR, undefined, id);
    if (conflict) return conflict;

    const statSheet = parseStatSheetFromInput(data);
    if (!statSheet) {
      return { success: false, stage: "validation", errors: { stat_sheet_json: "Stat sheet data is required" } };
    }

    const nonZeroRows = statSheet.filter((r) => r.base_value !== 0);

    const boundsErrors = await validateStatSheetBounds(db, nonZeroRows);
    if (boundsErrors) {
      return { success: false, stage: "validation", errors: boundsErrors };
    }

    applyStatusAction(data);

    const nonColumnKeys = ITEM_CONFIG.nonColumnKeys ?? [];
    const itemData = Object.fromEntries(
      Object.entries(data).filter(([k]) => !nonColumnKeys.includes(k)),
    );

    let updateQuery;
    try {
      updateQuery = ItemModel.prepareUpdate(itemData, { id });
    } catch (error) {
      const err = error as Error & { errors?: Record<string, string> };
      return { success: false, stage: "validation", errors: err.errors ?? { general: err.message } };
    }

    try {
      await withTransaction(db, async (txDb) => {
        await executeWrite(txDb, updateQuery);
        const deleteQuery = ItemStatBaseModel.prepareDelete({ item_id: id });
        await executeWrite(txDb, deleteQuery);
        await insertStatSheet(txDb, id, nonZeroRows);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      return { success: false, stage: "database", error: message };
    }

    const selectQuery = ItemModel.prepareSelect({ id });
    const rows = await selectMany(db, selectQuery);
    if (rows.length === 0) {
      return { success: false, stage: "not_found", error: `Record ${id} not found after update` };
    }

    return { success: true, data: ItemModel.deserialize(rows[0]!) };
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, ItemModel, id);
  },

  async checkNameAvailable(
    name: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (name.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkNameUniqueness(db, ItemModel, name, "", undefined, excludeId);
    return { available: check.available };
  },

  async checkMachineNameAvailable(
    machineName: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (machineName.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkFieldUniqueness(db, ItemModel, "machine_name", machineName, "", undefined, excludeId);
    return { available: check.available };
  },
};
