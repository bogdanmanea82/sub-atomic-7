// src/view-service/molecules/views/build-list-view.ts
// Transforms an array of entities into a complete list view model

import type { EntityConfig } from "@config/types";
import type { ListView, ListViewRow } from "../../types";
import { prepareField } from "../../atoms/field-display";

/**
 * Builds a complete list view model from an array of raw entity records.
 * Visible columns are all fields except those marked displayFormat "hidden".
 */
export function buildListView(
  entities: Record<string, unknown>[],
  config: EntityConfig
): ListView {
  const visibleFields = config.fields.filter(
    (f) => f.displayFormat !== "hidden"
  );

  const columns = visibleFields.map((f) => ({
    name: f.name,
    label: f.label,
  }));

  const rows: ListViewRow[] = entities.map((entity) => ({
    id: entity["id"] as string,
    fields: visibleFields.map((field) => prepareField(entity, field)),
  }));

  return {
    title: config.pluralDisplayName,
    columns,
    rows,
    count: entities.length,
  };
}
