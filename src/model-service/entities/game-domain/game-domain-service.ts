// src/model-service/entities/game-domain/game-domain-service.ts
// Layer 2 organism — public API for all GameDomain database operations

import type { GameDomain } from "@model/entities/game-domain/game-domain-model";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { GameDomainModel } from "@model/entities/game-domain/game-domain-model";
import { GAME_DOMAIN_CONFIG } from "@config/entities/game-domain";
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
import {
  updateEntityWorkflow,
  type UpdateWorkflowResult,
} from "../../molecules/workflows/update-entity-workflow";
import {
  deleteEntityWorkflow,
  type DeleteWorkflowResult,
} from "../../molecules/workflows/delete-entity-workflow";
import { checkNameUniqueness, checkFieldUniqueness } from "../../atoms/uniqueness";
import { applyStatusAction } from "../../sub-atoms/apply-status-action";

const NAME_ERROR = "A Game Domain with this name already exists.";
const MACHINE_NAME_ERROR = "A Game Domain with this machine_name already exists.";

export const GameDomainService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameDomain>> {
    applyStatusAction(input);
    const db = getConnection();

    const name = input["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const check = await checkNameUniqueness(db, GameDomainModel, name, NAME_ERROR);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = input["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, GameDomainModel, "machine_name", machineName, MACHINE_NAME_ERROR);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return createEntityWorkflow(db, GameDomainModel, input);
  },

  async findById(id: string): Promise<SelectWorkflowResult<GameDomain>> {
    const db = getConnection();
    return selectEntityWorkflow(db, GAME_DOMAIN_CONFIG, GameDomainModel, id);
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<GameDomain>> {
    const db = getConnection();
    return selectManyWorkflow(db, GameDomainModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<GameDomain>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, GameDomainModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<GameDomain>> {
    applyStatusAction(data);
    const db = getConnection();

    const name = data["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const check = await checkNameUniqueness(db, GameDomainModel, name, NAME_ERROR, undefined, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = data["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, GameDomainModel, "machine_name", machineName, MACHINE_NAME_ERROR, undefined, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return updateEntityWorkflow(
      db,
      GameDomainModel,
      id,
      data,
      GAME_DOMAIN_CONFIG.nonColumnKeys,
    );
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, GameDomainModel, id);
  },

  async checkNameAvailable(
    name: string,
    scope?: Record<string, unknown>,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (name.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkNameUniqueness(db, GameDomainModel, name, "", scope, excludeId);
    return { available: check.available };
  },

  async checkMachineNameAvailable(
    machineName: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (machineName.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkFieldUniqueness(db, GameDomainModel, "machine_name", machineName, "", undefined, excludeId);
    return { available: check.available };
  },
};
