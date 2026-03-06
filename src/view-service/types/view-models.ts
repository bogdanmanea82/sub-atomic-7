// src/view-service/types/view-models.ts
// Contracts between Layer 4 (View Service) and Layer 5 (View)

/**
 * A single field prepared for display.
 * value is always a string — formatting already applied.
 */
export interface DisplayField {
  readonly name: string;
  readonly label: string;
  readonly value: string;
  readonly rawValue: unknown;
  readonly displayFormat: string;
}

/**
 * A single row in a list view.
 */
export interface ListViewRow {
  readonly id: string;
  readonly fields: readonly DisplayField[];
}

/**
 * Complete data for rendering a list page.
 */
export interface ListView {
  readonly title: string;
  readonly columns: readonly { readonly name: string; readonly label: string }[];
  readonly rows: readonly ListViewRow[];
  readonly count: number;
}

/**
 * Complete data for rendering a detail/show page.
 */
export interface DetailView {
  readonly title: string;
  readonly fields: readonly DisplayField[];
}

/**
 * A single field prepared for an HTML form input.
 */
export interface FormField {
  readonly name: string;
  readonly label: string;
  readonly inputType: string;
  readonly value: unknown;
  readonly required: boolean;
  readonly error?: string;
}

/**
 * Complete data for rendering a create or edit form.
 */
export interface FormView {
  readonly title: string;
  readonly fields: readonly FormField[];
}
