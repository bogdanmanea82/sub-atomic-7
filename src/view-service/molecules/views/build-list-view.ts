// src/view-service/molecules/views/build-list-view.ts
// Transforms an array of entities into a complete list view model

import type { EntityConfig } from "@config/types";
import type { ListView, ListViewRow, ListRowMetadata, PaginationMeta, ReferenceLookup } from "../../types";
import { prepareField } from "../../atoms/field-display";
import { formatDatetime } from "../../sub-atoms/formatters";

/**
 * Builds a complete list view model from an array of raw entity records.
 * Filters by showInList (default true), sorts by listOrder (default 50).
 * Populates row metadata for tooltip display (description, timestamps, archive info).
 * referenceLookup resolves foreign key UUIDs to display names.
 */
export function buildListView(
  entities: Record<string, unknown>[],
  config: EntityConfig,
  referenceLookup?: ReferenceLookup,
  pagination?: PaginationMeta,
): ListView {
  const visibleFields = config.fields
    .filter((f) => f.displayFormat !== "hidden" && f.showInList !== false)
    .slice()
    .sort((a, b) => (a.listOrder ?? 50) - (b.listOrder ?? 50));

  const columns = visibleFields.map((f) => ({
    name: f.name,
    label: f.label,
  }));

  const rows: ListViewRow[] = entities.map((entity) => {
    const metadata: ListRowMetadata = {
      description: entity["description"] != null ? String(entity["description"]) : undefined,
      createdAt: entity["created_at"] instanceof Date ? formatDatetime(entity["created_at"]) : undefined,
      updatedAt: entity["updated_at"] instanceof Date ? formatDatetime(entity["updated_at"]) : undefined,
      archivedAt: entity["archived_at"] instanceof Date ? formatDatetime(entity["archived_at"]) : undefined,
      archivedReason: entity["archived_reason"] != null ? String(entity["archived_reason"]) : undefined,
    };

    return {
      id: entity["id"] as string,
      fields: visibleFields.map((field) => prepareField(entity, field, referenceLookup)),
      metadata,
    };
  });

  return {
    title: config.pluralDisplayName,
    columns,
    rows,
    count: pagination ? pagination.totalCount : entities.length,
    pagination,
  };
}
