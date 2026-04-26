// src/model-service/atoms/uniqueness/check-name-and-machine-name-uniqueness.ts
// Checks both name and machine_name uniqueness in a single call.
// Used by entity services that enforce both constraints on create() and update().
//
// nameScope controls the name uniqueness check:
//   undefined              → global name check (no scope)
//   false                  → skip name check entirely (scoped entities when FK is absent)
//   Record<string,unknown> → scoped name check (e.g. { game_domain_id: "uuid" })
//
// machine_name is always checked globally (no scope).

import type { SQL } from "bun";
import type { PreparedQuery } from "@model/universal/sub-atoms/types/prepared-query";
import { checkNameUniqueness } from "./check-name-uniqueness";
import { checkFieldUniqueness } from "./check-field-uniqueness";

interface UniquenessModel {
  prepareSelect(conditions?: Record<string, unknown>): PreparedQuery;
  deserialize(row: Record<string, unknown>): { id: string };
}

type UniquenessConflict = {
  readonly success: false;
  readonly stage: "validation";
  readonly errors: Record<string, string>;
};

export async function checkNameAndMachineNameUniqueness(
  db: SQL,
  model: UniquenessModel,
  input: Record<string, unknown>,
  nameError: string,
  machineNameError: string,
  nameScope?: Record<string, unknown> | false,
  excludeId?: string,
): Promise<UniquenessConflict | null> {
  if (nameScope !== false) {
    const name = input["name"];
    if (typeof name === "string" && name.trim() !== "") {
      const check = await checkNameUniqueness(db, model, name, nameError, nameScope, excludeId);
      if (!check.available) {
        return { success: false, stage: "validation", errors: { name: check.error } };
      }
    }
  }

  const machineName = input["machine_name"];
  if (typeof machineName === "string" && machineName.trim() !== "") {
    const check = await checkFieldUniqueness(db, model, "machine_name", machineName, machineNameError, undefined, excludeId);
    if (!check.available) {
      return { success: false, stage: "validation", errors: { machine_name: check.error } };
    }
  }

  return null;
}
