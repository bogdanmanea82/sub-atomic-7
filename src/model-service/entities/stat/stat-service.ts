// src/model-service/entities/stat/stat-service.ts
// Layer 2 organism — public API for all Stat database operations.
//
// Uniqueness note: machine_name (not name) is Stat's unique identifier.
// checkNameUniqueness() hardcodes { name } conditions, so machine_name
// uniqueness is checked inline via selectManyWorkflow with { machine_name }.

import type { Stat } from "@model/entities/stat/stat-model";
import { StatModel } from "@model/entities/stat/stat-model";
import { STAT_CONFIG } from "@config/entities/stat";
import { getConnection } from "../../sub-atoms/database";
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
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import {
  updateEntityWorkflow,
  type UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";

const MACHINE_NAME_ERROR = "A Stat with this machine_name already exists.";

export const StatService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<Stat>> {
    const db = getConnection();

    const machineName = input["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const existing = await selectManyWorkflow(db, StatModel, { machine_name: machineName });
      if (existing.success && existing.data.length > 0) {
        return { success: false, stage: "validation", errors: { machine_name: MACHINE_NAME_ERROR } };
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
    const db = getConnection();

    const machineName = data["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const existing = await selectManyWorkflow(db, StatModel, { machine_name: machineName });
      const conflicts = existing.success
        ? existing.data.filter((s) => s.id !== id)
        : [];
      if (conflicts.length > 0) {
        return { success: false, stage: "validation", errors: { machine_name: MACHINE_NAME_ERROR } };
      }
    }

    return updateEntityWorkflow(db, StatModel, id, data);
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, StatModel, id);
  },

  async checkMachineNameAvailable(
    machineName: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (machineName.trim() === "") return { available: false };
    const db = getConnection();
    const existing = await selectManyWorkflow(db, StatModel, { machine_name: machineName });
    if (!existing.success) return { available: true };
    const conflicts = excludeId
      ? existing.data.filter((s) => s.id !== excludeId)
      : existing.data;
    return { available: conflicts.length === 0 };
  },
};
