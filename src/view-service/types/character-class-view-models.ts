// src/view-service/types/character-class-view-models.ts
// View model contracts for CharacterClass L4 ↔ L5 boundary.

import type { FormView, DetailView } from "./view-models";

/**
 * A single stat sheet row prepared for both form and detail rendering.
 * Carries enough metadata for the view layer to display range labels and
 * an error message when base_value falls outside [stat_value_min, stat_value_max].
 */
export interface StatSheetViewRow {
  readonly stat_id: string;
  readonly stat_name: string;
  readonly stat_category: string;
  readonly stat_data_type: string;
  readonly stat_value_min: number;
  readonly stat_value_max: number;
  readonly stat_default_value: number;
  readonly base_value: number;
  readonly error?: string;
}

/**
 * Extended FormView that carries the stat sheet alongside the standard fields.
 * The `statSheet` array is pre-sorted by category, then name.
 */
export interface CharacterClassFormView extends FormView {
  readonly statSheet: readonly StatSheetViewRow[];
}

/**
 * Extended DetailView that carries the stat sheet for read-only rendering.
 */
export interface CharacterClassDetailView extends DetailView {
  readonly statSheet: readonly StatSheetViewRow[];
}
