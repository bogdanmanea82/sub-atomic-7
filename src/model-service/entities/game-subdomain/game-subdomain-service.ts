// src/model-service/entities/game-subdomain/game-subdomain-service.ts
// Layer 2 organism — public API for all GameSubdomain database operations.
// Name uniqueness is scoped to the parent GameDomain — two different domains
// can each have a subdomain called "Combat", but within one domain names are unique.

import type { GameSubdomain } from "@model/entities/game-subdomain/game-subdomain-model";
import type { PaginationParams } from "@model/universal/sub-atoms/types/pagination-params";
import { GameSubdomainModel } from "@model/entities/game-subdomain/game-subdomain-model";
import { GAME_SUBDOMAIN_CONFIG } from "@config/entities/game-subdomain";
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

const NAME_ERROR = "A Game Subdomain with this name already exists in this domain.";
const MACHINE_NAME_ERROR = "A Game Subdomain with this machine_name already exists.";

export const GameSubdomainService = {
  async create(
    input: Record<string, unknown>,
  ): Promise<CreateWorkflowResult<GameSubdomain>> {
    applyStatusAction(input);
    const db = getConnection();

    const name = input["name"];
    const gameDomainId = input["game_domain_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameDomainId === "string") {
      const check = await checkNameUniqueness(db, GameSubdomainModel, name, NAME_ERROR, { game_domain_id: gameDomainId });
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = input["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, GameSubdomainModel, "machine_name", machineName, MACHINE_NAME_ERROR);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return createEntityWorkflow(db, GameSubdomainModel, input);
  },

  async findById(id: string): Promise<SelectWorkflowResult<GameSubdomain>> {
    const db = getConnection();
    return selectEntityWorkflow(db, GAME_SUBDOMAIN_CONFIG, GameSubdomainModel, id);
  },

  async findMany(
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyWorkflowResult<GameSubdomain>> {
    const db = getConnection();
    return selectManyWorkflow(db, GameSubdomainModel, conditions);
  },

  async findManyPaginated(
    pagination: PaginationParams,
    conditions?: Record<string, unknown>,
  ): Promise<SelectManyPaginatedResult<GameSubdomain>> {
    const db = getConnection();
    return selectManyPaginatedWorkflow(db, GameSubdomainModel, pagination, conditions);
  },

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateWorkflowResult<GameSubdomain>> {
    applyStatusAction(data);
    const db = getConnection();

    const name = data["name"];
    const gameDomainId = data["game_domain_id"];
    if (typeof name === "string" && name.trim() !== "" && typeof gameDomainId === "string") {
      const check = await checkNameUniqueness(db, GameSubdomainModel, name, NAME_ERROR, { game_domain_id: gameDomainId }, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }

    const machineName = data["machine_name"];
    if (typeof machineName === "string" && machineName.trim() !== "") {
      const check = await checkFieldUniqueness(db, GameSubdomainModel, "machine_name", machineName, MACHINE_NAME_ERROR, undefined, id);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { machine_name: check.error } };
      }
    }

    return updateEntityWorkflow(db, GameSubdomainModel, id, data, GAME_SUBDOMAIN_CONFIG.nonColumnKeys);
  },

  async delete(id: string): Promise<DeleteWorkflowResult> {
    const db = getConnection();
    return deleteEntityWorkflow(db, GameSubdomainModel, id);
  },

  async checkNameAvailable(
    name: string,
    scope?: Record<string, unknown>,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (name.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkNameUniqueness(db, GameSubdomainModel, name, "", scope, excludeId);
    return { available: check.available };
  },

  async checkMachineNameAvailable(
    machineName: string,
    excludeId?: string,
  ): Promise<{ available: boolean }> {
    if (machineName.trim() === "") return { available: false };
    const db = getConnection();
    const check = await checkFieldUniqueness(db, GameSubdomainModel, "machine_name", machineName, "", undefined, excludeId);
    return { available: check.available };
  },
};
