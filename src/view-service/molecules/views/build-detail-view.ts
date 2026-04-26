// src/view-service/molecules/views/build-detail-view.ts
// Transforms a single entity into a detail view model

import type { EntityConfig } from "@config/types";
import type { DetailView, ReferenceLookup } from "../../types";
import { prepareField } from "../../atoms/field-display";

/**
 * Builds a detail view model from a single entity record.
 * Includes all fields except those marked displayFormat "hidden".
 * The title uses the entity's name field if available, otherwise falls back to displayName.
 * referenceLookup resolves foreign key UUIDs to display names.
 */
export function buildDetailView(
  entity: Record<string, unknown>,
  config: EntityConfig,
  referenceLookup?: ReferenceLookup,
): DetailView {
  const visibleFields = config.fields.filter(
    (f) => f.displayFormat !== "hidden"
  );

  const nameValue = entity["name"];
  const title =
    typeof nameValue === "string" ? nameValue : config.displayName;

  const isActive = typeof entity["is_active"] === "boolean" ? entity["is_active"] : undefined;
  const archivedAt = typeof entity["archived_at"] === "string" ? entity["archived_at"] : undefined;

  return {
    title,
    fields: visibleFields.map((field) => prepareField(entity, field, referenceLookup)),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(archivedAt !== undefined ? { archivedAt } : {}),
  };
}
