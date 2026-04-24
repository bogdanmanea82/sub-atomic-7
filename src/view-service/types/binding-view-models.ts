// src/view-service/types/binding-view-models.ts
// Contracts between L4 (View Service) and L5 (View) for binding display data.
// All values are pre-formatted strings for direct rendering.

export type BindingOverrideDisplay = {
  readonly weightOverride: string;
  readonly minTier: string;
  readonly maxTier: string;
  readonly tierRange: string;
  readonly levelReqOverride: string;
};

export interface BindingDetailRow {
  readonly id: string;
  readonly targetName: string;
  readonly isIncluded: boolean;
  readonly weightOverride: string;
  readonly minTier: string;
  readonly maxTier: string;
  readonly levelReqOverride: string;
}
