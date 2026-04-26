// src/model-service/entities/stat/stat-service.ts
// Layer 2 organism — public API for all Stat database operations.

import type { Stat } from "@model/entities/stat/stat-model";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { StatModel } from "@model/entities/stat/stat-model";
import { STAT_CONFIG } from "@config/entities/stat";
import { getConnection } from "../../sub-atoms/database";
import { applyStatusAction } from "../../sub-atoms/apply-status-action";
import {
  createEntityWorkflow,
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
import {
  updateEntityWorkflow,
  type UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";
import { checkNameUniqueness, checkFieldUniqueness } from "../../atoms/uniqueness";

const NAME_ERROR = "A Stat with this name already exists.";
const MACHINE_NAME_ERROR = "A Stat with this machine_name already exists.";

export const StatService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<Stat>> {
    applyStatusAction(input);
    const db = getConnection();

    const name = input["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const check = await checkNameUniqueness(db, StatModel, name, NAME_ERROR);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = input["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, StatModel, "machine_name", machineName, MACHINE_NAME_ERROR);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return createEntityWorkflow(db, StatModel, input);
  },

  async findById(id: string): Promise<SelectWorkflowResult<Stat>> {
    const db = getConnection();
    return selectEntityWorkflow(db, STAT_CONFIG, StatModel, id);
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<Stat>> {
    const db = getConnection();
    return selectManyWorkflow(db, StatModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<Stat>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, StatModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<Stat>> {
    applyStatusAction(data);
    const db = getConnection();

    const name = data["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const check = await checkNameUniqueness(db, StatModel, name, NAME_ERROR, undefined, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = data["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, StatModel, "machine_name", machineName, MACHINE_NAME_ERROR, undefined, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return updateEntityWorkflow(db, StatModel, id, data, STAT_CONFIG.nonColumnKeys);
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, StatModel, id);
  },

  async checkNameAvailable(
    name: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (name.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkNameUniqueness(db, StatModel, name, "", undefined, excludeId);
    return { available: check.available };
  },

  async checkMachineNameAvailable(
    machineName: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (machineName.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkFieldUniqueness(db, StatModel, "machine_name", machineName, "", undefined, excludeId);
    return { available: check.available };
  },
};
