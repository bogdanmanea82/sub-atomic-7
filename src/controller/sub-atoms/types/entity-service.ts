// src/controller/sub-atoms/types/entity-service.ts
// Structural contract that any Layer 2 service must satisfy to work with handler factories

/**
 * Result types mirror the workflow result shapes from Layer 2.
 * Defined here independently so the controller layer has no direct import from workflow files.
 * TypeScript's structural typing ensures compatibility — shape must match, name does not.
 */

export type ServiceCreateResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly stage: "validation"; readonly errors: Record<string, string> }
  | { readonly success: false; readonly stage: "database"; readonly error: string };

export type ServiceSelectResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly stage: "not_found"; readonly error: string }
  | { readonly success: false; readonly stage: "database"; readonly error: string };

export type ServiceSelectManyResult<T> =
  | { readonly success: true; readonly data: T[] }
  | { readonly success: false; readonly stage: "database"; readonly error: string };

export type ServiceUpdateResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly stage: "validation"; readonly errors: Record<string, string> }
  | { readonly success: false; readonly stage: "not_found"; readonly error: string }
  | { readonly success: false; readonly stage: "database"; readonly error: string };

export type ServiceDeleteResult =
  | { readonly success: true }
  | { readonly success: false; readonly stage: "not_found"; readonly error: string }
  | { readonly success: false; readonly stage: "database"; readonly error: string };

/**
 * Any Layer 2 service object must satisfy this interface to be used with handler factories.
 * GameDomainService satisfies this structurally — no explicit declaration needed.
 */
export interface EntityService<TEntity> {
  create(input: Record<string, unknown>): Promise<ServiceCreateResult<TEntity>>;
  findById(id: string): Promise<ServiceSelectResult<TEntity>>;
  findMany(conditions?: Record<string, unknown>): Promise<ServiceSelectManyResult<TEntity>>;
  update(id: string, data: Record<string, unknown>): Promise<ServiceUpdateResult<TEntity>>;
  delete(id: string): Promise<ServiceDeleteResult>;
}
