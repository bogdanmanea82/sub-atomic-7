// src/view-service/types/tier-view-models.ts
// Contracts between L4 (View Service) and L5 (View) for tier display/form data.

export interface TierFormRow {
  readonly tier_index: number;
  readonly min_value: number | null;
  readonly max_value: number | null;
  readonly level_req: number;
  readonly spawn_weight: number;
}

export interface TierDetailRow {
  readonly tier_index: number;
  readonly min_value: string;
  readonly max_value: string;
  readonly level_req: string;
  readonly spawn_weight: string;
}

export interface TierFieldMeta {
  readonly name: string;
  readonly label: string;
  readonly inputType: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: string;
}
