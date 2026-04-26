// src/view-service/types/item-view-models.ts
// View model types for Item pages that extend the generic form/detail shapes.

import type { DetailView, FormView } from "./view-models";

export interface ItemStatBaseViewRow {
  readonly stat_id: string;
  readonly stat_name: string;
  readonly stat_category: string;
  readonly stat_data_type: string;
  readonly stat_value_min: number;
  readonly stat_value_max: number;
  readonly stat_default_value: number;
  readonly combination_type: string;
  readonly base_value: number;
  readonly error?: string;
}

export interface ItemFormView extends FormView {
  readonly statSheet: readonly ItemStatBaseViewRow[];
}

export interface ItemDetailView extends DetailView {
  readonly statSheet: readonly ItemStatBaseViewRow[];
}
