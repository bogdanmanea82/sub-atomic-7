// src/config/universal/molecules/standard-permissions.ts
// Default permission config shared by every CMS entity.
//
// All authoring entities follow the same rule: admins can write, public can read.
// Individual entities override getPermissions() only when they need a different policy.

import type { PermissionConfig } from "../../types";

export const STANDARD_PERMISSIONS: PermissionConfig = {
  create: "admin",
  read: "public",
  update: "admin",
  delete: "admin",
} as const;
